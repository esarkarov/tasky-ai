import { genAI } from '@/core/lib/google-ai';
import { GenerateContentResponse } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

type GenerateContentOptions = {
  thinkingBudget?: number;
  responseMimeType?: string;
};

export const geminiClient = {
  generateContent: async (contents: string, options?: GenerateContentOptions): Promise<GenerateContentResponse> => {
    const { thinkingBudget = 0, responseMimeType = 'application/json' } = options ?? {};

    return genAI.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents,
      config: {
        thinkingConfig: { thinkingBudget },
        responseMimeType,
      },
    });
  },
};
