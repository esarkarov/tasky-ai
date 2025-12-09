import { createMockAIContentResponse, createMockAITasks } from '@/core/test-setup/factories';
import { geminiClient } from '@/features/ai/clients/gemini.client';
import { aiService } from '@/features/ai/services/ai.service';
import { buildTaskGenerationPrompt } from '@/features/ai/utils/ai.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/ai/clients/gemini.client', () => ({
  geminiClient: {
    generateContent: vi.fn(),
  },
}));

vi.mock('@/features/ai/utils/ai.utils', () => ({
  buildTaskGenerationPrompt: vi.fn(),
}));

const mockGeminiClient = vi.mocked(geminiClient);
const mockBuildPrompt = vi.mocked(buildTaskGenerationPrompt);

describe('aiService', () => {
  const VALID_PROMPT = 'Create a project for building a website';
  const BUILT_PROMPT = 'System: Generate tasks. User: Create a project for building a website';

  const setupSuccessfulGeneration = (responseText: string = JSON.stringify(createMockAITasks())) => {
    mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
    mockGeminiClient.generateContent.mockResolvedValue(createMockAIContentResponse(responseText));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateProjectTasks', () => {
    it('should generate tasks when prompt is valid', async () => {
      const mockTasks = createMockAITasks();
      setupSuccessfulGeneration(JSON.stringify(mockTasks));

      const result = await aiService.generateProjectTasks(VALID_PROMPT);

      expect(mockBuildPrompt).toHaveBeenCalledWith(VALID_PROMPT);
      expect(mockGeminiClient.generateContent).toHaveBeenCalledWith(BUILT_PROMPT);
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when prompt is empty', async () => {
      const result = await aiService.generateProjectTasks('');

      expect(result).toEqual([]);
      expect(mockBuildPrompt).not.toHaveBeenCalled();
      expect(mockGeminiClient.generateContent).not.toHaveBeenCalled();
    });

    it('should return empty array when prompt is only whitespace', async () => {
      const result = await aiService.generateProjectTasks('   ');

      expect(result).toEqual([]);
      expect(mockBuildPrompt).not.toHaveBeenCalled();
      expect(mockGeminiClient.generateContent).not.toHaveBeenCalled();
    });

    it('should return empty array when response text is empty or whitespace', async () => {
      setupSuccessfulGeneration('   ');

      const result = await aiService.generateProjectTasks(VALID_PROMPT);

      expect(result).toEqual([]);
    });

    it('should return empty array when response is invalid JSON', async () => {
      setupSuccessfulGeneration('not-valid-json');

      const result = await aiService.generateProjectTasks(VALID_PROMPT);

      expect(result).toEqual([]);
    });

    it('should return empty array when response is not an array', async () => {
      setupSuccessfulGeneration(JSON.stringify({ invalid: 'object' }));

      const result = await aiService.generateProjectTasks(VALID_PROMPT);

      expect(result).toEqual([]);
    });

    it('should return empty array when client throws error', async () => {
      mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
      mockGeminiClient.generateContent.mockRejectedValue(new Error('API rate limit exceeded'));

      const result = await aiService.generateProjectTasks(VALID_PROMPT);

      expect(result).toEqual([]);
      expect(mockBuildPrompt).toHaveBeenCalledOnce();
      expect(mockGeminiClient.generateContent).toHaveBeenCalledOnce();
    });
  });
});
