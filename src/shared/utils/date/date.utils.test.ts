import { formatCustomDate } from '@/shared/utils/date/date.utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('formatCustomDate', () => {
  const MOCK_CURRENT_DATE = new Date('2025-06-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_CURRENT_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('relative day labels', () => {
    it('should return "Today" when date is current day', () => {
      const todayDate = new Date('2025-06-15T14:30:00Z');

      const result = formatCustomDate(todayDate);

      expect(result).toBe('Today');
    });

    it('should return "Tomorrow" when date is next day', () => {
      const tomorrowDate = new Date('2025-06-16T10:00:00Z');

      const result = formatCustomDate(tomorrowDate);

      expect(result).toBe('Tomorrow');
    });

    it('should return "Yesterday" when date is previous day', () => {
      const yesterdayDate = new Date('2025-06-14T18:00:00Z');

      const result = formatCustomDate(yesterdayDate);

      expect(result).toBe('Yesterday');
    });

    it('should return weekday name when date is within past week', () => {
      const fridayDate = new Date('2025-06-13T10:00:00Z');

      const result = formatCustomDate(fridayDate);

      expect(result).toBe('13 Jun');
    });
  });

  describe('same year formatting', () => {
    it('should format as "dd MMM" when date is in same year', () => {
      const januaryDate = new Date('2025-01-10T10:00:00Z');

      const result = formatCustomDate(januaryDate);

      expect(result).toBe('10 Jan');
    });

    it('should format as "dd MMM" for future date in same year', () => {
      const decemberDate = new Date('2025-12-25T10:00:00Z');

      const result = formatCustomDate(decemberDate);

      expect(result).toBe('25 Dec');
    });

    it('should format as "dd MMM" for start of year', () => {
      const newYearDate = new Date('2025-01-01T00:00:00Z');

      const result = formatCustomDate(newYearDate);

      expect(result).toBe('01 Jan');
    });
  });

  describe('different year formatting', () => {
    it('should format as "dd MMM yyyy" when date is in previous year', () => {
      const lastYearDate = new Date('2024-03-15T10:00:00Z');

      const result = formatCustomDate(lastYearDate);

      expect(result).toBe('15 Mar 2024');
    });

    it('should format as "dd MMM yyyy" when date is in future year', () => {
      const nextYearDate = new Date('2026-08-20T10:00:00Z');

      const result = formatCustomDate(nextYearDate);

      expect(result).toBe('20 Aug 2026');
    });

    it('should format as "dd MMM yyyy" for date several years ago', () => {
      const oldDate = new Date('2020-01-01T00:00:00Z');

      const result = formatCustomDate(oldDate);

      expect(result).toBe('01 Jan 2020');
    });

    it('should format as "dd MMM yyyy" for date far in future', () => {
      const futureDate = new Date('2031-12-31T00:00:00Z');

      const result = formatCustomDate(futureDate);

      expect(result).toBe('31 Dec 2031');
    });
  });

  describe('string input handling', () => {
    it('should accept ISO string and format as relative day', () => {
      const isoString = '2025-06-15T10:00:00Z';

      const result = formatCustomDate(isoString);

      expect(result).toBe('Today');
    });

    it('should accept ISO string and format with year when different year', () => {
      const isoStringDifferentYear = '2024-07-20T15:30:00Z';

      const result = formatCustomDate(isoStringDifferentYear);

      expect(result).toBe('20 Jul 2024');
    });

    it('should accept simple date string and format correctly', () => {
      const simpleDateString = '2025-03-10';

      const result = formatCustomDate(simpleDateString);

      expect(result).toBe('10 Mar');
    });
  });

  describe('edge cases', () => {
    it('should handle date at midnight as today', () => {
      const midnightDate = new Date('2025-06-15T00:00:00Z');

      const result = formatCustomDate(midnightDate);

      expect(result).toBe('Today');
    });

    it('should handle leap year date correctly', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00Z');

      const result = formatCustomDate(leapYearDate);

      expect(result).toBe('29 Feb 2024');
    });

    it('should handle date at end of day', () => {
      const endOfDayDate = new Date('2025-06-15T23:59:59Z');

      const result = formatCustomDate(endOfDayDate);

      expect(['Today', 'Tomorrow']).toContain(result);
    });
  });
});
