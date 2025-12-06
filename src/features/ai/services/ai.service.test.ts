import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '@/features/ai/services/ai.service';
import { geminiClient } from '@/features/ai/clients/gemini.client';
import { buildTaskGenerationPrompt } from '@/features/ai/utils/ai.utils';
import { createMockAIContentResponse, createMockAITasks } from '@/core/test-setup/factories';

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateProjectTasks', () => {
    describe('successful task generation', () => {
      it('should generate tasks from valid prompt', async () => {
        const mockTasks = createMockAITasks();
        const mockResponse = createMockAIContentResponse(JSON.stringify(mockTasks));
        mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
        mockGeminiClient.generateContent.mockResolvedValue(mockResponse);

        const result = await aiService.generateProjectTasks(VALID_PROMPT);

        expect(mockBuildPrompt).toHaveBeenCalledWith(VALID_PROMPT);
        expect(mockBuildPrompt).toHaveBeenCalledOnce();
        expect(mockGeminiClient.generateContent).toHaveBeenCalledWith(BUILT_PROMPT);
        expect(mockGeminiClient.generateContent).toHaveBeenCalledOnce();
        expect(result).toEqual(mockTasks);
      });
    });

    describe('invalid prompt handling', () => {
      it('should return empty array when prompt is empty string', async () => {
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
    });

    describe('invalid response handling', () => {
      it('should return empty array when response text is empty', async () => {
        const mockResponse = createMockAIContentResponse('');
        mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
        mockGeminiClient.generateContent.mockResolvedValue(mockResponse);

        const result = await aiService.generateProjectTasks(VALID_PROMPT);

        expect(result).toEqual([]);
      });

      it('should return empty array when response text is whitespace', async () => {
        const mockResponse = createMockAIContentResponse('   ');
        mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
        mockGeminiClient.generateContent.mockResolvedValue(mockResponse);

        const result = await aiService.generateProjectTasks(VALID_PROMPT);

        expect(result).toEqual([]);
      });

      it('should return empty array when response is invalid JSON', async () => {
        const mockResponse = createMockAIContentResponse('not-valid-json');
        mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
        mockGeminiClient.generateContent.mockResolvedValue(mockResponse);

        const result = await aiService.generateProjectTasks(VALID_PROMPT);

        expect(result).toEqual([]);
      });

      it('should return empty array when response is not an array', async () => {
        const mockResponse = createMockAIContentResponse(JSON.stringify({ invalid: 'object' }));
        mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
        mockGeminiClient.generateContent.mockResolvedValue(mockResponse);

        const result = await aiService.generateProjectTasks(VALID_PROMPT);

        expect(result).toEqual([]);
      });
    });

    describe('error handling', () => {
      it('should return empty array when client throws error', async () => {
        mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
        mockGeminiClient.generateContent.mockRejectedValue(new Error('API rate limit exceeded'));

        const result = await aiService.generateProjectTasks(VALID_PROMPT);

        expect(result).toEqual([]);
        expect(mockBuildPrompt).toHaveBeenCalledOnce();
        expect(mockGeminiClient.generateContent).toHaveBeenCalledOnce();
      });

      it('should return empty array when JSON parsing fails', async () => {
        const mockResponse = createMockAIContentResponse('{"incomplete": json');
        mockBuildPrompt.mockReturnValue(BUILT_PROMPT);
        mockGeminiClient.generateContent.mockResolvedValue(mockResponse);

        const result = await aiService.generateProjectTasks(VALID_PROMPT);

        expect(result).toEqual([]);
      });
    });
  });
});
