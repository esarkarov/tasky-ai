import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskDueDatePicker } from './TaskDueDatePicker';

vi.mock('@/components/atoms/RemoveDueDateButton/RemoveDueDateButton', () => ({
  RemoveDueDateButton: ({ onClick }: { onClick: () => void }) => (
    <button
      data-testid="remove-due-date"
      onClick={onClick}
      aria-label="Remove due date">
      Remove
    </button>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      onClick={onClick}
      disabled={disabled}
      {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="popover"
      data-open={open}>
      <div onClick={() => onOpenChange(!open)}>{children}</div>
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => <div>{children}</div>,
  PopoverContent: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <div
      id={id}
      role="dialog"
      aria-label="Select due date">
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({
    selected,
    onSelect,
  }: {
    selected?: Date;
    onSelect: (date: Date | undefined) => void;
    mode?: string;
    disabled?: { before: Date };
    autoFocus?: boolean;
  }) => (
    <div
      data-testid="calendar"
      data-selected={selected?.toISOString()}>
      <button onClick={() => onSelect(new Date('2024-12-31'))}>Select Date</button>
      <button onClick={() => onSelect(undefined)}>Clear Date</button>
    </div>
  ),
}));

vi.mock('@/utils/date/date.utils', () => ({
  formatCustomDate: (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
}));

vi.mock('@/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
  getTaskDueDateColorClass: (date: Date | null, _: boolean) => (date ? 'text-blue-500' : 'text-gray-500'),
}));

describe('TaskDueDatePicker', () => {
  const mockHandleDateSelect = vi.fn();
  const mockHandleDateRemove = vi.fn();

  const defaultProps = {
    dueDate: null,
    disabled: false,
    handleDateSelect: mockHandleDateSelect,
    handleDateRemove: mockHandleDateRemove,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render with default text when no date selected', () => {
      render(<TaskDueDatePicker {...defaultProps} />);

      expect(screen.getByText('Due date')).toBeInTheDocument();
    });

    it('should render with formatted date when date is selected', () => {
      render(
        <TaskDueDatePicker
          {...defaultProps}
          dueDate={new Date('2024-01-15')}
        />
      );

      expect(screen.getByText('Jan 15')).toBeInTheDocument();
    });

    it('should show remove button only when date is selected', () => {
      const { rerender } = render(<TaskDueDatePicker {...defaultProps} />);
      expect(screen.queryByTestId('remove-due-date')).not.toBeInTheDocument();

      rerender(
        <TaskDueDatePicker
          {...defaultProps}
          dueDate={new Date('2024-01-15')}
        />
      );
      expect(screen.getByTestId('remove-due-date')).toBeInTheDocument();
    });
  });

  describe('popover behavior', () => {
    it('should open popover when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskDueDatePicker {...defaultProps} />);

      await user.click(screen.getByText('Due date'));

      expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');
    });

    it('should close popover after selecting a date', async () => {
      const user = userEvent.setup();
      render(<TaskDueDatePicker {...defaultProps} />);

      await user.click(screen.getByText('Due date'));
      await user.click(screen.getByText('Select Date'));

      expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('date selection', () => {
    it('should call handleDateSelect with selected date', async () => {
      const user = userEvent.setup();
      render(<TaskDueDatePicker {...defaultProps} />);

      await user.click(screen.getByText('Due date'));
      await user.click(screen.getByText('Select Date'));

      expect(mockHandleDateSelect).toHaveBeenCalledWith(new Date('2024-12-31'));
    });

    it('should call handleDateSelect with null when clearing', async () => {
      const user = userEvent.setup();
      render(<TaskDueDatePicker {...defaultProps} />);

      await user.click(screen.getByText('Due date'));
      await user.click(screen.getByText('Clear Date'));

      expect(mockHandleDateSelect).toHaveBeenCalledWith(null);
    });

    it('should call handleDateRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskDueDatePicker
          {...defaultProps}
          dueDate={new Date('2024-01-15')}
        />
      );

      await user.click(screen.getByLabelText('Remove due date'));

      expect(mockHandleDateRemove).toHaveBeenCalledTimes(1);
    });

    it('should pass selected date to calendar', () => {
      const dueDate = new Date('2024-01-15');
      render(
        <TaskDueDatePicker
          {...defaultProps}
          dueDate={dueDate}
        />
      );

      expect(screen.getByTestId('calendar')).toHaveAttribute('data-selected', dueDate.toISOString());
    });
  });

  describe('disabled state', () => {
    it('should disable trigger and prevent popover opening', async () => {
      const user = userEvent.setup();
      render(
        <TaskDueDatePicker
          {...defaultProps}
          disabled={true}
        />
      );

      const triggerButton = screen.getByRole('button', { name: /due date/i });
      expect(triggerButton).toBeDisabled();

      await user.click(triggerButton);

      expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(<TaskDueDatePicker {...defaultProps} />);

      expect(screen.getByLabelText('Due date selector')).toBeInTheDocument();
      expect(container.querySelector('[aria-haspopup="dialog"]')).toBeInTheDocument();
      expect(container.querySelector('[aria-controls="due-date-calendar"]')).toBeInTheDocument();
      expect(screen.getByLabelText('Select due date')).toBeInTheDocument();
    });

    it('should update aria-expanded based on popover state', async () => {
      const user = userEvent.setup();
      const { container } = render(<TaskDueDatePicker {...defaultProps} />);

      expect(container.querySelector('[aria-expanded="false"]')).toBeInTheDocument();

      await user.click(screen.getByText('Due date'));
      expect(container.querySelector('[aria-expanded="true"]')).toBeInTheDocument();
    });

    it('should hide CalendarIcon from screen readers', () => {
      const { container } = render(<TaskDueDatePicker {...defaultProps} />);

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });
  });
});
