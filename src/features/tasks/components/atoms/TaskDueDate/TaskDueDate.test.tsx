import { formatCustomDate } from '@/shared/utils/date/date.utils';
import { getTaskDueDateColorClass } from '@/shared/utils/ui/ui.utils';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskDueDate } from './TaskDueDate';

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
  getTaskDueDateColorClass: vi.fn(),
}));

vi.mock('@/shared/utils/date/date.utils', () => ({
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

  describe('null dueDate', () => {
    it('returns null when dueDate is null', () => {
      const { container } = render(
        <TaskDueDate
          completed={false}
          dueDate={null}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('does not call formatting utilities', () => {
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

  describe('date object', () => {
    it('renders formatted date', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      expect(screen.getByText(MOCK_FORMATTED_DATE)).toBeInTheDocument();
    });

    it('calls formatCustomDate with date', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      expect(mockedFormatCustomDate).toHaveBeenCalledWith(MOCK_DATE);
    });

    it('renders time element with correct attributes', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      const time = screen.getByText(MOCK_FORMATTED_DATE);
      expect(time.tagName).toBe('TIME');
      expect(time).toHaveAttribute('dateTime', MOCK_DATE.toISOString());
    });
  });

  describe('date string', () => {
    it('renders formatted date from string', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE_STRING}
        />
      );
      expect(screen.getByText(MOCK_FORMATTED_DATE)).toBeInTheDocument();
    });

    it('calls formatCustomDate with string', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE_STRING}
        />
      );
      expect(mockedFormatCustomDate).toHaveBeenCalledWith(MOCK_DATE_STRING);
    });

    it('renders correct dateTime attribute', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE_STRING}
        />
      );
      const time = screen.getByText(MOCK_FORMATTED_DATE);
      expect(time).toHaveAttribute('dateTime', MOCK_DATE_STRING);
    });
  });

  describe('calendar icon', () => {
    it('renders icon', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('renders correct icon size', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      expect(screen.getByTestId('calendar-icon')).toHaveAttribute('data-size', '14');
    });

    it('hides icon from screen readers', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      expect(screen.getByTestId('calendar-icon')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('completed status', () => {
    it('calls getTaskDueDateColorClass with completed=true', () => {
      render(
        <TaskDueDate
          completed={true}
          dueDate={MOCK_DATE}
        />
      );
      expect(mockedGetTaskDueDateColorClass).toHaveBeenCalledWith(MOCK_DATE, true);
    });

    it('calls getTaskDueDateColorClass with completed=false', () => {
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
    it('has proper aria-label', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      expect(screen.getByLabelText('Task due date')).toBeInTheDocument();
    });

    it('uses semantic time element', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      expect(screen.getByText(MOCK_FORMATTED_DATE).tagName).toBe('TIME');
    });

    it('has valid ISO dateTime', () => {
      render(
        <TaskDueDate
          completed={false}
          dueDate={MOCK_DATE}
        />
      );
      const time = screen.getByText(MOCK_FORMATTED_DATE);
      const value = time.getAttribute('dateTime');
      expect(value).toBeTruthy();
      expect(() => new Date(value!)).not.toThrow();
    });
  });

  describe('different date scenarios', () => {
    it('handles past dates', () => {
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

    it('handles future dates', () => {
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

    it('handles today date', () => {
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
