import { genAI } from '@/core/lib/google-ai';
import { createMockAIContentResponse } from '@/core/test-setup/factories';
import { DEFAULT_GEMINI_MODEL } from '@/features/ai/clients/gemini.client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { geminiClient } from './gemini.client';

vi.mock('@/core/lib/google-ai', () => ({
  genAI: {
    models: {
      generateContent: vi.fn(),
    },
  },
}));

const mockedGenAI = vi.mocked(genAI);
const mockedGenerateContent = vi.mocked(mockedGenAI.models.generateContent);

describe('gemini client', () => {
  const MOCK_CONTENTS = 'Test prompt content';

  const expectGenerateContentCalledWith = (contents: string) => {
    expect(mockedGenerateContent).toHaveBeenCalledWith({
      model: DEFAULT_GEMINI_MODEL,
      contents,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: 'application/json',
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateContent', () => {
    it('should generate content successfully with correct parameters', async () => {
      const mockResponse = createMockAIContentResponse();
      mockedGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiClient.generateContent(MOCK_CONTENTS);

      expectGenerateContentCalledWith(MOCK_CONTENTS);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty contents string', async () => {
      const emptyContents = '';
      const mockResponse = createMockAIContentResponse();
      mockedGenerateContent.mockResolvedValue(mockResponse);

      await geminiClient.generateContent(emptyContents);

      expectGenerateContentCalledWith(emptyContents);
    });

    it('should propagate errors when API fails', async () => {
      mockedGenerateContent.mockRejectedValue(new Error('API error'));

      await expect(geminiClient.generateContent(MOCK_CONTENTS)).rejects.toThrow('API error');
      expectGenerateContentCalledWith(MOCK_CONTENTS);
    });
  });
});
