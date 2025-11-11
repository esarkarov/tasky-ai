import { buildTaskGenerationPrompt } from '@/features/ai/utils/ai.utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ai utils', () => {
  const MOCK_DATE = new Date('2023-01-01T00:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('buildTaskGenerationPrompt', () => {
    const REQUIRED_SCHEMA_FIELDS = ['Task Schema:', 'content: string;', 'due_date: Date | null;'];
    const REQUIRED_INSTRUCTIONS = [
      'Generate and return a list of tasks',
      'Ensure tasks align with the provided prompt',
      "Set the 'due_date' relative to today's date",
      'Return an array of tasks matching the schema',
      'Output: Array<Task>',
    ];

    const expectContainsAll = (result: string, items: string[]) => {
      items.forEach((item) => {
        expect(result).toContain(item);
      });
    };

    describe('prompt handling', () => {
      const mockPrompts = [
        {
          description: 'standard prompt',
          prompt: 'Build a todo app',
          expectedSubstrings: ['Build a todo app'],
        },
        {
          description: 'empty prompt',
          prompt: '',
          expectedSubstrings: ['Prompt: '],
        },
        {
          description: 'prompt with special characters',
          prompt: 'Task with "quotes" and {braces}',
          expectedSubstrings: ['Task with "quotes" and {braces}'],
        },
      ];

      it.each(mockPrompts)('should handle $description', ({ prompt, expectedSubstrings }) => {
        const result = buildTaskGenerationPrompt(prompt);

        expectContainsAll(result, expectedSubstrings);
        expect(result).toContain(MOCK_DATE.toString());
      });
    });

    describe('schema and instructions', () => {
      it('should include all required schema fields', () => {
        const prompt = 'test prompt';

        const result = buildTaskGenerationPrompt(prompt);

        expectContainsAll(result, REQUIRED_SCHEMA_FIELDS);
      });

      it('should include all required instructions', () => {
        const prompt = 'test prompt';

        const result = buildTaskGenerationPrompt(prompt);

        expectContainsAll(result, REQUIRED_INSTRUCTIONS);
      });
    });

    describe('date inclusion', () => {
      it('should include current date in generated content', () => {
        const prompt = 'Build a todo app';

        const result = buildTaskGenerationPrompt(prompt);

        expect(result).toContain(MOCK_DATE.toString());
      });
    });
  });
});
