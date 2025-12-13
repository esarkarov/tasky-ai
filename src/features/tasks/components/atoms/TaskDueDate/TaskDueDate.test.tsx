import { TaskDueDate } from '@/features/tasks/components/atoms/TaskDueDate/TaskDueDate';
import { formatCustomDate } from '@/shared/utils/date/date.utils';
import { getTaskDueDateColorClass } from '@/shared/utils/ui/ui.utils';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  interface RenderOptions {
    completed?: boolean;
    dueDate?: Date | string | null;
  }

  const renderComponent = ({ completed = false, dueDate = MOCK_DATE }: RenderOptions = {}) => {
    return render(
      <TaskDueDate
        completed={completed}
        dueDate={dueDate}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedFormatCustomDate.mockReturnValue(MOCK_FORMATTED_DATE);
    mockedGetTaskDueDateColorClass.mockReturnValue(undefined);
  });

  describe('null dueDate', () => {
    it('should return null and not call formatting utilities when dueDate is null', () => {
      const { container } = renderComponent({ dueDate: null });

      expect(container.firstChild).toBeNull();
      expect(mockedFormatCustomDate).not.toHaveBeenCalled();
      expect(mockedGetTaskDueDateColorClass).not.toHaveBeenCalled();
    });
  });

  describe('rendering with Date object', () => {
    it('should render formatted date with correct time element and attributes', () => {
      renderComponent({ dueDate: MOCK_DATE });

      const time = screen.getByText(MOCK_FORMATTED_DATE);
      expect(time).toBeInTheDocument();
      expect(time.tagName).toBe('TIME');
      expect(time).toHaveAttribute('dateTime', MOCK_DATE.toISOString());
      expect(mockedFormatCustomDate).toHaveBeenCalledWith(MOCK_DATE);
    });
  });

  describe('rendering with date string', () => {
    it('should render formatted date with correct dateTime attribute', () => {
      renderComponent({ dueDate: MOCK_DATE_STRING });

      const time = screen.getByText(MOCK_FORMATTED_DATE);
      expect(time).toBeInTheDocument();
      expect(time).toHaveAttribute('dateTime', MOCK_DATE_STRING);
      expect(mockedFormatCustomDate).toHaveBeenCalledWith(MOCK_DATE_STRING);
    });
  });

  describe('calendar icon', () => {
    it('should render icon with correct size and aria-hidden', () => {
      renderComponent();

      const icon = screen.getByTestId('calendar-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-size', '14');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('completed status', () => {
    it('should call getTaskDueDateColorClass with correct completed status', () => {
      renderComponent({ completed: true });
      expect(mockedGetTaskDueDateColorClass).toHaveBeenCalledWith(MOCK_DATE, true);

      renderComponent({ completed: false });
      expect(mockedGetTaskDueDateColorClass).toHaveBeenCalledWith(MOCK_DATE, false);
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label and semantic time element with valid ISO dateTime', () => {
      renderComponent();

      expect(screen.getByLabelText('Task due date')).toBeInTheDocument();

      const time = screen.getByText(MOCK_FORMATTED_DATE);
      expect(time.tagName).toBe('TIME');

      const dateTimeValue = time.getAttribute('dateTime');
      expect(dateTimeValue).toBeTruthy();
      expect(() => new Date(dateTimeValue!)).not.toThrow();
    });
  });

  describe('different date scenarios', () => {
    it('should handle past dates', () => {
      const pastDate = new Date('2020-01-01T10:00:00.000Z');
      mockedFormatCustomDate.mockReturnValue('Jan 1, 2020');

      renderComponent({ dueDate: pastDate });

      expect(screen.getByText('Jan 1, 2020')).toBeInTheDocument();
      expect(mockedFormatCustomDate).toHaveBeenCalledWith(pastDate);
    });

    it('should handle future dates', () => {
      const futureDate = new Date('2025-12-31T23:59:59.000Z');
      mockedFormatCustomDate.mockReturnValue('Dec 31, 2025');

      renderComponent({ dueDate: futureDate });

      expect(screen.getByText('Dec 31, 2025')).toBeInTheDocument();
      expect(mockedFormatCustomDate).toHaveBeenCalledWith(futureDate);
    });

    it('should handle today date', () => {
      const today = new Date();
      mockedFormatCustomDate.mockReturnValue('Today');

      renderComponent({ dueDate: today });

      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });
});
