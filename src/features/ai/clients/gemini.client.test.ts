import { genAI } from '@/core/lib/google-ai';
import { createMockAIContentResponse } from '@/core/test-setup/factories';
import { DEFAULT_GEMINI_MODEL, geminiClient } from '@/features/ai/clients/gemini.client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/lib/google-ai', () => ({
  genAI: {
    models: {
      generateContent: vi.fn(),
    },
  },
}));

const mockGenerateContent = vi.mocked(genAI.models.generateContent);

describe('geminiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateContent', () => {
    it('should generate content with default configuration', async () => {
      const contents = 'Test prompt content';
      const mockResponse = createMockAIContentResponse();
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiClient.generateContent(contents);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: DEFAULT_GEMINI_MODEL,
        contents,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: 'application/json',
        },
      });
      expect(mockGenerateContent).toHaveBeenCalledOnce();
      expect(result).toEqual(mockResponse);
    });

    it('should generate content with custom thinking budget', async () => {
      const contents = 'Complex reasoning task';
      const mockResponse = createMockAIContentResponse();
      mockGenerateContent.mockResolvedValue(mockResponse);

      await geminiClient.generateContent(contents, { thinkingBudget: 10000 });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: DEFAULT_GEMINI_MODEL,
        contents,
        config: {
          thinkingConfig: { thinkingBudget: 10000 },
          responseMimeType: 'application/json',
        },
      });
    });

    it('should generate content with custom response MIME type', async () => {
      const contents = 'Generate text response';
      const mockResponse = createMockAIContentResponse();
      mockGenerateContent.mockResolvedValue(mockResponse);

      await geminiClient.generateContent(contents, { responseMimeType: 'text/plain' });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: DEFAULT_GEMINI_MODEL,
        contents,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: 'text/plain',
        },
      });
    });

    it('should generate content with both custom options', async () => {
      const contents = 'Custom options test';
      const mockResponse = createMockAIContentResponse();
      mockGenerateContent.mockResolvedValue(mockResponse);

      await geminiClient.generateContent(contents, {
        thinkingBudget: 5000,
        responseMimeType: 'text/plain',
      });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: DEFAULT_GEMINI_MODEL,
        contents,
        config: {
          thinkingConfig: { thinkingBudget: 5000 },
          responseMimeType: 'text/plain',
        },
      });
    });

    it('should handle empty content string', async () => {
      const emptyContents = '';
      const mockResponse = createMockAIContentResponse();
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiClient.generateContent(emptyContents);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: DEFAULT_GEMINI_MODEL,
        contents: emptyContents,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: 'application/json',
        },
      });
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
