import { generateID, toTitleCase, truncateString } from '@/shared/utils/text/text.utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('text utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('toTitleCase', () => {
    const mockCapitalizeStringCases = [
      { input: 'hello world', expected: 'Hello world', description: 'multi-word string' },
      { input: 'a', expected: 'A', description: 'single character' },
      { input: '', expected: '', description: 'empty string' },
    ];

    it.each(mockCapitalizeStringCases)('should handle $description correctly', ({ input, expected }) => {
      const result = toTitleCase(input);

      expect(result).toBe(expected);
    });
  });

  describe('truncateString', () => {
    const ELLIPSIS = '...';

    describe('when string exceeds max length', () => {
      it('should truncate and append ellipsis', () => {
        const input = 'This is a very long string that needs truncation';
        const maxLength = 20;

        const result = truncateString(input, maxLength);

        expect(result).toBe('This is a very long...');
        expect(result.length).toBe(19 + ELLIPSIS.length);
      });
    });

    it('should return original string when shorter', () => {
      const input = 'Short string';
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

    describe('edge cases', () => {
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

        expect(result).toBe(ELLIPSIS);
      });

      it('should handle max length of 0', () => {
        const input = 'Hello';
        const maxLength = 0;

        const result = truncateString(input, maxLength);

        expect(result).toBe('Hell...');
      });
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

    it('should generate a valid alphanumeric ID', () => {
      vi.setSystemTime(MOCK_TIMESTAMP);
      randomSpy.mockReturnValue(0.123456789);

      const result = generateID();

      expect(result).toMatch(ID_PATTERN);
      expect(randomSpy).toHaveBeenCalled();
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
  });
});
