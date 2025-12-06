import { geminiClient } from '@/features/ai/clients/gemini.client';
import { AIGeneratedTask } from '@/features/ai/types';
import { buildTaskGenerationPrompt } from '@/features/ai/utils/ai.utils';

function isValidTasksArray(data: unknown): data is AIGeneratedTask[] {
  return Array.isArray(data) && data.every((item) => item && typeof item === 'object');
}

export const aiService = {
  async generateProjectTasks(prompt: string): Promise<AIGeneratedTask[]> {
    if (!prompt?.trim()) return [];

    try {
      const contentPrompt = buildTaskGenerationPrompt(prompt);
      const response = await geminiClient.generateContent(contentPrompt);

      const text = response.text?.trim();
      if (!text) return [];

      const parsed = JSON.parse(text);

      if (!isValidTasksArray(parsed)) {
        return [];
      }

      return parsed;
    } catch (error) {
      console.error('Failed to generate tasks:', error);
      return [];
    }
  },
};
