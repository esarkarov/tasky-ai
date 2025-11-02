import { formatCustomDate } from '@/utils/date/date.utils';
import { getTaskDueDateColorClass } from '@/utils/ui/ui.utils';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskDueDate } from './TaskDueDate';

vi.mock('@/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
  getTaskDueDateColorClass: vi.fn(),
}));

vi.mock('@/utils/date/date.utils', () => ({
  formatCustomDate: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  CalendarDays: ({ size }: { size: number }) => (
    <svg
      data-testid="calendar-icon"
      data-size={size}
      aria-hidden="true"
    />
  ),
}));

const mockedGetTaskDueDateColorClass = vi.mocked(getTaskDueDateColorClass);
const mockedFormatCustomDate = vi.mocked(formatCustomDate);

describe('TaskDueDate', () => {
  const MOCK_DATE = new Date('2024-01-15T10:00:00.000Z');
  const MOCK_DATE_STRING = '2024-01-15T10:00:00.000Z';
  const MOCK_FORMATTED_DATE = 'Jan 15';

  beforeEach(() => {
    vi.clearAllMocks();
    mockedFormatCustomDate.mockReturnValue(MOCK_FORMATTED_DATE);
    mockedGetTaskDueDateColorClass.mockReturnValue(undefined);
  });

  describe('rendering with null dueDate', () => {
    it('should return null when dueDate is null', () => {
      const { container } = render(
        <TaskDueDate
          completed={false}
          dueDate={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not call formatting functions when dueDate is null', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={null}
        />
      );

      expect(mockedFormatCustomDate).not.toHaveBeenCalled();
      expect(mockedGetTaskDueDateColorClass).not.toHaveBeenCalled();
    });
  });

  describe('rendering with Date object', () => {
    it('should render formatted date', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      expect(screen.getByText(MOCK_FORMATTED_DATE)).toBeInTheDocument();
    });

    it('should call formatCustomDate with the date', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      expect(mockedFormatCustomDate).toHaveBeenCalledWith(MOCK_DATE);
    });

    it('should render time element with correct dateTime attribute', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      const timeElement = screen.getByText(MOCK_FORMATTED_DATE);
      expect(timeElement.tagName).toBe('TIME');
      expect(timeElement).toHaveAttribute('dateTime', MOCK_DATE.toISOString());
    });
  });

  describe('rendering with date string', () => {
    it('should render formatted date from string', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE_STRING}
        />
      );

      expect(screen.getByText(MOCK_FORMATTED_DATE)).toBeInTheDocument();
    });

    it('should call formatCustomDate with the date string', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE_STRING}
        />
      );

      expect(mockedFormatCustomDate).toHaveBeenCalledWith(MOCK_DATE_STRING);
    });

    it('should convert string to ISO format for dateTime attribute', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE_STRING}
        />
      );

      const timeElement = screen.getByText(MOCK_FORMATTED_DATE);
      expect(timeElement).toHaveAttribute('dateTime', MOCK_DATE_STRING);
    });
  });

  describe('calendar icon', () => {
    it('should render calendar icon', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('should render icon with correct size', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      const icon = screen.getByTestId('calendar-icon');
      expect(icon).toHaveAttribute('data-size', '14');
    });

    it('should hide icon from screen readers', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      const icon = screen.getByTestId('calendar-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('completed status', () => {
    it('should pass completed=true to color class function', () => {
      render(
        <TaskDueDate
          completed={true}
          dueDate={MOCK_DATE}
        />
      );

      expect(mockedGetTaskDueDateColorClass).toHaveBeenCalledWith(MOCK_DATE, true);
    });

    it('should pass completed=false to color class function', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      expect(mockedGetTaskDueDateColorClass).toHaveBeenCalledWith(MOCK_DATE, false);
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      expect(screen.getByLabelText('Task due date')).toBeInTheDocument();
    });

    it('should use semantic time element', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      const timeElement = screen.getByText(MOCK_FORMATTED_DATE);
      expect(timeElement.tagName).toBe('TIME');
    });

    it('should have valid ISO dateTime attribute', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );

      const timeElement = screen.getByText(MOCK_FORMATTED_DATE);
      const dateTimeValue = timeElement.getAttribute('dateTime');
      expect(dateTimeValue).toBeTruthy();
      expect(() => new Date(dateTimeValue!)).not.toThrow();
    });
  });

  describe('different date formats', () => {
    it('should handle past dates', () => {
      const pastDate = new Date('2020-01-01T10:00:00.000Z');
      mockedFormatCustomDate.mockReturnValue('Jan 1, 2020');

      render(
        <TaskDueDate
          completed={false}
          dueDate={pastDate}
        />
      );

      expect(screen.getByText('Jan 1, 2020')).toBeInTheDocument();
      expect(mockedFormatCustomDate).toHaveBeenCalledWith(pastDate);
    });

    it('should handle future dates', () => {
      const futureDate = new Date('2025-12-31T23:59:59.000Z');
      mockedFormatCustomDate.mockReturnValue('Dec 31, 2025');

      render(
        <TaskDueDate
          completed={false}
          dueDate={futureDate}
        />
      );

      expect(screen.getByText('Dec 31, 2025')).toBeInTheDocument();
      expect(mockedFormatCustomDate).toHaveBeenCalledWith(futureDate);
    });

    it("should handle today's date", () => {
      const today = new Date();
      mockedFormatCustomDate.mockReturnValue('Today');

      render(
        <TaskDueDate
          completed={false}
          dueDate={today}
        />
      );

      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });
});
