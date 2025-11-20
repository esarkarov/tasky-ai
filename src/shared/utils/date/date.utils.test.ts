import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatCustomDate } from './date.utils';

describe('formatCustomDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('relative day formatting', () => {
    it('returns "Today" for current date', () => {
      const date = new Date('2025-06-15T14:30:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('Today');
    });

    it('returns "Tomorrow" for next day', () => {
      const date = new Date('2025-06-16T10:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('Tomorrow');
    });

    it('returns "Yesterday" for previous day', () => {
      const date = new Date('2025-06-14T18:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('Yesterday');
    });

    it('returns weekday name for dates within past week', () => {
      const friday = new Date('2025-06-13T10:00:00Z');

      const result = formatCustomDate(friday);

      expect(result).toBe('13 Jun');
    });

    it('returns formatted date for dates beyond relative range', () => {
      const weekAgo = new Date('2025-06-08T10:00:00Z');

      const result = formatCustomDate(weekAgo);

      expect(result).toBe('08 Jun');
    });
  });

  describe('date formatting for same year', () => {
    it('formats date as "dd MMM" when in same year but not a relative day', () => {
      const date = new Date('2025-01-10T10:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('10 Jan');
    });

    it('formats future date as "dd MMM" when in same year', () => {
      const date = new Date('2025-12-25T10:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('25 Dec');
    });

    it('formats date at start of year as "dd MMM"', () => {
      const date = new Date('2025-01-01T00:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('01 Jan');
    });
  });

  describe('date formatting for different years', () => {
    it('formats date as "dd MMM yyyy" when in previous year', () => {
      const date = new Date('2024-03-15T10:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('15 Mar 2024');
    });

    it('formats date as "dd MMM yyyy" when in future year', () => {
      const date = new Date('2026-08-20T10:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('20 Aug 2026');
    });

    it('formats very old date with full year', () => {
      const date = new Date('2020-01-01T00:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('01 Jan 2020');
    });

    it('formats far future date with full year', () => {
      const date = new Date('2031-12-31T00:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('31 Dec 2031');
    });
  });

  describe('string input handling', () => {
    it('accepts and formats ISO string date', () => {
      const dateString = '2025-06-15T10:00:00Z';

      const result = formatCustomDate(dateString);

      expect(result).toBe('Today');
    });

    it('accepts and formats date string for different year', () => {
      const dateString = '2024-07-20T15:30:00Z';

      const result = formatCustomDate(dateString);

      expect(result).toBe('20 Jul 2024');
    });

    it('accepts and formats simple date string', () => {
      const dateString = '2025-03-10';

      const result = formatCustomDate(dateString);

      expect(result).toBe('10 Mar');
    });
  });

  describe('edge cases', () => {
    it('handles dates at midnight', () => {
      const date = new Date('2025-06-15T00:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('Today');
    });

    it('handles dates just before midnight', () => {
      const date = new Date('2025-06-15T23:59:59Z');

      const result = formatCustomDate(date);

      expect(['Today', 'Tomorrow']).toContain(result);
    });

    it('handles leap year date', () => {
      const date = new Date('2024-02-29T12:00:00Z');

      const result = formatCustomDate(date);

      expect(result).toBe('29 Feb 2024');
    });
  });
});
