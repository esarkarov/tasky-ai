import { genAI } from '@/core/lib/google-ai';
import { createMockAIContentResponse } from '@/core/test-setup/factories';
import { DEFAULT_GEMINI_MODEL, geminiClient } from '@/features/ai/clients/gemini.client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface GenerateContentOptions {
  thinkingBudget?: number;
  responseMimeType?: string;
}

vi.mock('@/core/lib/google-ai', () => ({
  genAI: {
    models: {
      generateContent: vi.fn(),
    },
  },
}));

const mockGenerateContent = vi.mocked(genAI.models.generateContent);

describe('geminiClient', () => {
  const setupMockResponse = () => {
    const mockResponse = createMockAIContentResponse();
    mockGenerateContent.mockResolvedValue(mockResponse);
    return mockResponse;
  };

  const expectGenerateContentCalledWith = (contents: string, options: GenerateContentOptions = {}) => {
    const { thinkingBudget = 0, responseMimeType = 'application/json' } = options;

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: DEFAULT_GEMINI_MODEL,
      contents,
      config: {
        thinkingConfig: { thinkingBudget },
        responseMimeType,
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateContent', () => {
    it('should generate content with default configuration', async () => {
      const contents = 'Test prompt content';
      const mockResponse = setupMockResponse();

      const result = await geminiClient.generateContent(contents);

      expectGenerateContentCalledWith(contents);
      expect(mockGenerateContent).toHaveBeenCalledOnce();
      expect(result).toEqual(mockResponse);
    });

    it('should generate content with custom thinking budget', async () => {
      const contents = 'Complex reasoning task';
      setupMockResponse();

      await geminiClient.generateContent(contents, { thinkingBudget: 10000 });

      expectGenerateContentCalledWith(contents, { thinkingBudget: 10000 });
    });

    it('should generate content with custom response MIME type', async () => {
      const contents = 'Generate text response';
      setupMockResponse();

      await geminiClient.generateContent(contents, { responseMimeType: 'text/plain' });

      expectGenerateContentCalledWith(contents, { responseMimeType: 'text/plain' });
    });

    it('should generate content with custom thinking budget and MIME type', async () => {
      const contents = 'Custom options test';
      setupMockResponse();

      await geminiClient.generateContent(contents, {
        thinkingBudget: 5000,
        responseMimeType: 'text/plain',
      });

      expectGenerateContentCalledWith(contents, {
        thinkingBudget: 5000,
        responseMimeType: 'text/plain',
      });
    });

    it('should handle empty content string', async () => {
      const emptyContents = '';
      const mockResponse = setupMockResponse();

      const result = await geminiClient.generateContent(emptyContents);

      expectGenerateContentCalledWith(emptyContents);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate API errors', async () => {
      const contents = 'Test content';
      mockGenerateContent.mockRejectedValue(new Error('API rate limit exceeded'));

      await expect(geminiClient.generateContent(contents)).rejects.toThrow('API rate limit exceeded');
      expect(mockGenerateContent).toHaveBeenCalledOnce();
    });

    it('should propagate network errors', async () => {
      const contents = 'Test content';
      mockGenerateContent.mockRejectedValue(new Error('Network connection failed'));

      await expect(geminiClient.generateContent(contents)).rejects.toThrow('Network connection failed');
    });
  });
});
