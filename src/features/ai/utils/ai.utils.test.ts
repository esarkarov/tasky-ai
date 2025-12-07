import { buildTaskGenerationPrompt } from '@/features/ai/utils/ai.utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('buildTaskGenerationPrompt', () => {
  const MOCK_DATE = new Date('2025-01-15T10:30:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('prompt content', () => {
    it('should include user prompt in generated text', () => {
      const userPrompt = 'Build a mobile todo app';

      const result = buildTaskGenerationPrompt(userPrompt);

      expect(result).toContain('Build a mobile todo app');
      expect(result).toContain('Prompt:');
    });

    it('should handle empty prompt', () => {
      const emptyPrompt = '';

      const result = buildTaskGenerationPrompt(emptyPrompt);

      expect(result).toContain('Prompt:');
      expect(result).toContain('Generate and return a list of tasks');
    });

    it('should preserve special characters in prompt', () => {
      const promptWithSpecialChars = 'Task with "quotes" and {braces} & symbols';

      const result = buildTaskGenerationPrompt(promptWithSpecialChars);

      expect(result).toContain('Task with "quotes" and {braces} & symbols');
    });
  });

  describe('schema definition', () => {
    it('should include task schema with content field', () => {
      const prompt = 'Create tasks';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toContain('Task Schema:');
      expect(result).toContain('content: string;');
    });

    it('should include task schema with due_date field', () => {
      const prompt = 'Create tasks';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toContain('due_date: Date | null;');
    });
  });

  describe('instructions', () => {
    it('should include instruction to generate tasks', () => {
      const prompt = 'Create tasks';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toContain('Generate and return a list of tasks');
    });

    it('should include instruction to align with prompt', () => {
      const prompt = 'Create tasks';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toContain('Ensure tasks align with the provided prompt');
    });

    it('should include instruction for date handling', () => {
      const prompt = 'Create tasks';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toContain("Set the 'due_date' relative to today's date");
    });

    it('should include instruction for return format', () => {
      const prompt = 'Create tasks';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toContain('Return an array of tasks matching the schema');
      expect(result).toContain('Output: Array<Task>');
    });
  });

  describe('date reference', () => {
    it('should include current date in prompt', () => {
      const prompt = 'Create weekly tasks';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toContain(MOCK_DATE.toString());
    });

    it('should use consistent date across multiple calls', () => {
      const prompt = 'Create tasks';

      const result1 = buildTaskGenerationPrompt(prompt);
      const result2 = buildTaskGenerationPrompt(prompt);

      expect(result1).toContain(MOCK_DATE.toString());
      expect(result2).toContain(MOCK_DATE.toString());
      expect(result1).toEqual(result2);
    });
  });

  describe('output structure', () => {
    it('should return non-empty string', () => {
      const prompt = 'Create tasks';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all essential components', () => {
      const prompt = 'Build a project management app';

      const result = buildTaskGenerationPrompt(prompt);

      expect(result).toContain('Prompt:');
      expect(result).toContain('Task Schema:');
      expect(result).toContain('Requirements:');
      expect(result).toContain('Output:');
    });
  });
});
