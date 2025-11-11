import { aiRepository } from '@/features/ai/repositories/ai.repository';
import { AIGeneratedTask } from '@/features/ai/types';
import { buildTaskGenerationPrompt } from '@/features/ai/utils/ai.utils';

export const aiService = {
  async generateProjectTasks(prompt: string): Promise<AIGeneratedTask[]> {
    if (!prompt?.trim()) return [];

    try {
      const contentResponse = await aiRepository.generateContent(buildTaskGenerationPrompt(prompt));
      const contentResponseText = contentResponse.text?.trim();

      if (!contentResponseText) return [];

      const aiTasks = JSON.parse(contentResponseText) as AIGeneratedTask[];

      return aiTasks;
    } catch {
      return [];
    }
  },
};
