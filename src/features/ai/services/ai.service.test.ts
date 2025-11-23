import { createMockAIContentResponse } from '@/core/test-setup/factories';
import { geminiClient } from '@/features/ai/clients/gemini.client';
import { aiService } from '@/features/ai/services/ai.service';
import { AIGeneratedTask } from '@/features/ai/types';
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

const mockedGeminiClient = vi.mocked(geminiClient);
const mockedbuildTaskGenerationPrompt = vi.mocked(buildTaskGenerationPrompt);

describe('aiService', () => {
  const MOCK_PROMPT = 'Create a project for building a website';
  const MOCK_GENERATED_CONTENTS = 'generated-contents';

  const createMockTasks = (): AIGeneratedTask[] => [
    {
      content: 'Setup React project',
      due_date: null,
      completed: false,
    },
    {
      content: 'Install dependencies',
      due_date: null,
      completed: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateProjectTasks', () => {
    describe('when prompt is invalid', () => {
      const mockInvalidPrompts = [
        { description: 'empty string', prompt: '' },
        { description: 'only whitespace', prompt: '   ' },
      ];

      it.each(mockInvalidPrompts)('should return empty array when prompt is $description', async ({ prompt }) => {
        const result = await aiService.generateProjectTasks(prompt);

        expect(result).toEqual([]);
        expect(mockedbuildTaskGenerationPrompt).not.toHaveBeenCalled();
        expect(mockedGeminiClient.generateContent).not.toHaveBeenCalled();
      });
    });

    describe('when prompt is valid', () => {
      it('should generate tasks successfully', async () => {
        const mockTasks = createMockTasks();
        const mockResponse = createMockAIContentResponse(JSON.stringify(mockTasks));
        mockedbuildTaskGenerationPrompt.mockReturnValue(MOCK_GENERATED_CONTENTS);
        mockedGeminiClient.generateContent.mockResolvedValue(mockResponse);

        const result = await aiService.generateProjectTasks(MOCK_PROMPT);

        expect(mockedbuildTaskGenerationPrompt).toHaveBeenCalledWith(MOCK_PROMPT);
        expect(mockedGeminiClient.generateContent).toHaveBeenCalledWith(MOCK_GENERATED_CONTENTS);
        expect(result).toEqual(mockTasks);
      });
    });

    describe('when AI response is invalid', () => {
      const mockInvalidResponses = [
        { description: 'empty string', responseText: '' },
        { description: 'only whitespace', responseText: '   ' },
        { description: 'invalid JSON', responseText: 'invalid-json' },
      ];

      it.each(mockInvalidResponses)(
        'should return empty array when response text is $description',
        async ({ responseText }) => {
          const mockResponse = createMockAIContentResponse(responseText);
          mockedbuildTaskGenerationPrompt.mockReturnValue(MOCK_GENERATED_CONTENTS);
          mockedGeminiClient.generateContent.mockResolvedValue(mockResponse);

          const result = await aiService.generateProjectTasks(MOCK_PROMPT);

          expect(result).toEqual([]);
        }
      );
    });

    describe('when repository fails', () => {
      it('should return empty array', async () => {
        mockedbuildTaskGenerationPrompt.mockReturnValue(MOCK_GENERATED_CONTENTS);
        mockedGeminiClient.generateContent.mockRejectedValue(new Error('API error'));

        const result = await aiService.generateProjectTasks(MOCK_PROMPT);

        expect(result).toEqual([]);
      });
    });
  });
});
