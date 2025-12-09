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

  it('should include user prompt and current date in generated text', () => {
    const userPrompt = 'Build a mobile todo app';

    const result = buildTaskGenerationPrompt(userPrompt);

    expect(result).toContain('Build a mobile todo app');
    expect(result).toContain('Prompt:');
    expect(result).toContain(MOCK_DATE.toString());
  });

  it('should handle empty prompt and special characters', () => {
    const emptyPrompt = '';
    const specialCharPrompt = 'Task with "quotes" and {braces} & symbols';

    const emptyResult = buildTaskGenerationPrompt(emptyPrompt);
    const specialResult = buildTaskGenerationPrompt(specialCharPrompt);

    expect(emptyResult).toContain('Prompt:');
    expect(emptyResult).toContain('Generate and return a list of tasks');
    expect(specialResult).toContain('Task with "quotes" and {braces} & symbols');
  });

  it('should include task schema with required fields', () => {
    const prompt = 'Create tasks';

    const result = buildTaskGenerationPrompt(prompt);

    expect(result).toContain('Task Schema:');
    expect(result).toContain('content: string;');
    expect(result).toContain('due_date: Date | null;');
  });

  it('should include all required instructions', () => {
    const prompt = 'Create tasks';

    const result = buildTaskGenerationPrompt(prompt);

    expect(result).toContain('Generate and return a list of tasks');
    expect(result).toContain('Ensure tasks align with the provided prompt');
    expect(result).toContain("Set the 'due_date' relative to today's date");
    expect(result).toContain('Return an array of tasks matching the schema');
    expect(result).toContain('Output: Array<Task>');
  });

  it('should include all essential prompt components', () => {
    const prompt = 'Build a project management app';

    const result = buildTaskGenerationPrompt(prompt);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Prompt:');
    expect(result).toContain('Task Schema:');
    expect(result).toContain('Requirements:');
    expect(result).toContain('Output:');
  });

  it('should generate consistent output across multiple calls', () => {
    const prompt = 'Create tasks';

    const result1 = buildTaskGenerationPrompt(prompt);
    const result2 = buildTaskGenerationPrompt(prompt);

    expect(result1).toEqual(result2);
  });
});
