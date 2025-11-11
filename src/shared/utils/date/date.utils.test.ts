import { formatCustomDate } from '@/shared/utils/date/date.utils';
import { toTitleCase } from '@/shared/utils/text/text.utils';
import { format, formatRelative, isSameYear } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/constants/weekdays', () => ({
  WEEKDAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
}));

vi.mock('@/shared/utils/text/text.utils', () => ({
  toTitleCase: vi.fn(),
}));

vi.mock('date-fns', () => ({
  format: vi.fn(),
  formatRelative: vi.fn(),
  isSameYear: vi.fn(),
}));

const mockedToTitleCase = vi.mocked(toTitleCase);
const mockedFormat = vi.mocked(format);
const mockedFormatRelative = vi.mocked(formatRelative);
const mockedIsSameYear = vi.mocked(isSameYear);

describe('date utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatCustomDate', () => {
    type DateMockSetup = {
      relativeDay: string;
      titleCaseDay: string;
      isSameYear?: boolean;
      formattedDate?: string;
    };

    const setupDateMocks = ({ relativeDay, titleCaseDay, isSameYear: sameYear, formattedDate }: DateMockSetup) => {
      const relativeFormat = relativeDay.includes('at') ? relativeDay : `${relativeDay} at 12:00`;
      mockedFormatRelative.mockReturnValue(relativeFormat);
      mockedToTitleCase.mockReturnValue(titleCaseDay);

      if (sameYear !== undefined) {
        mockedIsSameYear.mockReturnValue(sameYear);
      }

      if (formattedDate) {
        mockedFormat.mockReturnValue(formattedDate);
      }
    };

    describe('when date is a weekday', () => {
      it('should return title-cased weekday name', () => {
        const date = new Date('2023-01-01');
        setupDateMocks({
          relativeDay: 'Monday',
          titleCaseDay: 'Monday',
        });

        const result = formatCustomDate(date);

        expect(mockedFormatRelative).toHaveBeenCalledWith(date, expect.any(Date));
        expect(mockedToTitleCase).toHaveBeenCalledWith('Monday');
        expect(result).toBe('Monday');
      });
    });

    describe('when date is not a weekday', () => {
      it('should return formatted date without year for same year', () => {
        const date = new Date('2023-06-15');
        setupDateMocks({
          relativeDay: 'Yesterday',
          titleCaseDay: 'Yesterday',
          isSameYear: true,
          formattedDate: '15 Jun',
        });

        const result = formatCustomDate(date);

        expect(mockedFormatRelative).toHaveBeenCalledWith(date, expect.any(Date));
        expect(mockedIsSameYear).toHaveBeenCalledWith(date, expect.any(Date));
        expect(mockedFormat).toHaveBeenCalledWith(date, 'dd MMM');
        expect(result).toBe('15 Jun');
      });

      it('should return formatted date with year for different year', () => {
        const date = new Date('2022-06-15');
        setupDateMocks({
          relativeDay: 'Yesterday',
          titleCaseDay: 'Yesterday',
          isSameYear: false,
          formattedDate: '15 Jun 2022',
        });

        const result = formatCustomDate(date);

        expect(mockedFormatRelative).toHaveBeenCalledWith(date, expect.any(Date));
        expect(mockedIsSameYear).toHaveBeenCalledWith(date, expect.any(Date));
        expect(mockedFormat).toHaveBeenCalledWith(date, 'dd MMM yyyy');
        expect(result).toBe('15 Jun 2022');
      });

      it('should handle relative format without "at" separator', () => {
        const date = new Date('2023-01-01');
        setupDateMocks({
          relativeDay: 'Today',
          titleCaseDay: 'Today',
          isSameYear: true,
          formattedDate: '01 Jan',
        });

        const result = formatCustomDate(date);

        expect(mockedToTitleCase).toHaveBeenCalledWith('Today');
        expect(result).toBe('01 Jan');
      });
    });

    describe('date input types', () => {
      const mockDateTypes = [
        {
          type: 'Date object',
          input: new Date('2023-01-01'),
          expectedDay: 'Tuesday',
        },
        {
          type: 'string',
          input: '2023-01-01',
          expectedDay: 'Tuesday',
        },
      ];

      it.each(mockDateTypes)('should handle $type input', ({ input, expectedDay }) => {
        setupDateMocks({
          relativeDay: expectedDay,
          titleCaseDay: expectedDay,
        });

        const result = formatCustomDate(input);

        expect(mockedFormatRelative).toHaveBeenCalledWith(input, expect.any(Date));
        expect(result).toBe(expectedDay);
      });
    });
  });
});
