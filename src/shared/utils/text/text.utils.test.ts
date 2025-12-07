import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toTitleCase, truncateString, generateID } from '@/shared/utils/text/text.utils';

describe('text utils', () => {
  describe('toTitleCase', () => {
    it('should capitalize first letter of multi-word string', () => {
      const input = 'hello world';

      const result = toTitleCase(input);

      expect(result).toBe('Hello world');
    });

    it('should capitalize single character', () => {
      const input = 'a';

      const result = toTitleCase(input);

      expect(result).toBe('A');
    });

    it('should return empty string when input is empty', () => {
      const input = '';

      const result = toTitleCase(input);

      expect(result).toBe('');
    });

    it('should preserve rest of string as is', () => {
      const input = 'hello WORLD';

      const result = toTitleCase(input);

      expect(result).toBe('Hello WORLD');
    });

    it('should handle already capitalized string', () => {
      const input = 'Hello';

      const result = toTitleCase(input);

      expect(result).toBe('Hello');
    });
  });

  describe('truncateString', () => {
    it('should truncate string when exceeds max length', () => {
      const input = 'This is a very long string that needs truncation';
      const maxLength = 20;

      const result = truncateString(input, maxLength);

      expect(result).toBe('This is a very long...');
    });

    it('should append ellipsis when truncating', () => {
      const input = 'This is a long string';
      const maxLength = 10;

      const result = truncateString(input, maxLength);

      expect(result.endsWith('...')).toBe(true);
    });

    it('should return original string when shorter than max length', () => {
      const input = 'Short text';
      const maxLength = 20;

      const result = truncateString(input, maxLength);

      expect(result).toBe(input);
    });

    it('should return original string when equal to max length', () => {
      const input = 'Exactly twenty chars';
      const maxLength = 20;

      const result = truncateString(input, maxLength);

      expect(result).toBe(input);
      expect(result.length).toBe(maxLength);
    });

    it('should handle empty string', () => {
      const input = '';
      const maxLength = 10;

      const result = truncateString(input, maxLength);

      expect(result).toBe('');
    });

    it('should handle max length of 1', () => {
      const input = 'Hello';
      const maxLength = 1;

      const result = truncateString(input, maxLength);

      expect(result).toBe('...');
    });

    it('should handle max length of 0', () => {
      const input = 'Hello';
      const maxLength = 0;

      const result = truncateString(input, maxLength);

      expect(result).toBe('Hell...');
    });
  });

  describe('generateID', () => {
    const MOCK_TIMESTAMP = 1672531200000;
    const ID_PATTERN = /^[a-z0-9]+$/;
    let randomSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      vi.useFakeTimers();
      randomSpy = vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.useRealTimers();
      randomSpy.mockRestore();
    });

    it('should generate alphanumeric ID', () => {
      vi.setSystemTime(MOCK_TIMESTAMP);
      randomSpy.mockReturnValue(0.123456789);

      const result = generateID();

      expect(result).toMatch(ID_PATTERN);
    });

    it('should call Math.random to generate random component', () => {
      randomSpy.mockReturnValue(0.5);

      generateID();

      expect(randomSpy).toHaveBeenCalledOnce();
    });

    it('should generate unique IDs for different random values', () => {
      let callCount = 0;
      randomSpy.mockImplementation(() => {
        callCount++;
        return callCount * 0.1;
      });

      const id1 = generateID();
      const id2 = generateID();

      expect(id1).not.toBe(id2);
    });

    it('should incorporate timestamp in base36 format', () => {
      vi.setSystemTime(MOCK_TIMESTAMP);
      randomSpy.mockReturnValue(0.5);
      const expectedTimestampPart = MOCK_TIMESTAMP.toString(36);

      const result = generateID();

      expect(result).toContain(expectedTimestampPart);
    });

    it('should generate different IDs at different times', () => {
      randomSpy.mockReturnValue(0.5);
      vi.setSystemTime(MOCK_TIMESTAMP);
      const id1 = generateID();

      vi.setSystemTime(MOCK_TIMESTAMP + 1000);
      const id2 = generateID();

      expect(id1).not.toBe(id2);
    });

    it('should generate non-empty ID', () => {
      randomSpy.mockReturnValue(0.5);

      const result = generateID();

      expect(result.length).toBeGreaterThan(0);
    });
  });
});
