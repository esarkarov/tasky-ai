import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskDueDatePicker } from './TaskDueDatePicker';

const mockSetIsOpen = vi.fn();
const mockClose = vi.fn();

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => ({
    isOpen: false,
    setIsOpen: mockSetIsOpen,
    close: mockClose,
    open: vi.fn(),
    toggle: vi.fn(),
  }),
}));

vi.mock('@/shared/utils/date/date.utils', () => ({
  formatCustomDate: vi.fn((date: Date | null) => {
    if (!date) return 'Due date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }),
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
  getTaskDueDateColorClass: vi.fn(() => 'text-default'),
}));

vi.mock('@/shared/components/atoms/RemoveDueDateButton/RemoveDueDateButton', () => ({
  RemoveDueDateButton: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      data-testid="remove-date-button">
      Remove
    </button>
  ),
}));

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: string;
  variant?: string;
  size?: string;
  className?: string;
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    variant,
    size,
    className,
    'aria-haspopup': ariaHaspopup,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
  }: ButtonProps) => (
    <button
      type={type as 'button'}
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
      onClick={onClick}
      aria-haspopup={ariaHaspopup}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}>
      {children}
    </button>
  ),
}));

interface CalendarProps {
  mode: string;
  disabled: { before: Date };
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  autoFocus: boolean;
}

vi.mock('@/shared/components/ui/calendar', () => ({
  Calendar: ({ mode, selected, onSelect, autoFocus }: CalendarProps) => (
    <div
      data-testid="calendar"
      data-mode={mode}
      data-auto-focus={autoFocus}
      data-selected={selected?.toISOString() ?? 'undefined'}>
      <button onClick={() => onSelect(new Date('2025-12-31'))}>Select Date</button>
    </div>
  ),
}));

interface PopoverProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PopoverContentProps {
  children: React.ReactNode;
  id: string;
  className: string;
  role: string;
  'aria-label': string;
}

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: PopoverProps) => (
    <div
      data-testid="popover"
      data-open={open}
      onClick={() => onOpenChange(!open)}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children, id, className, role, 'aria-label': ariaLabel }: PopoverContentProps) => (
    <div
      data-testid="popover-content"
      id={id}
      className={className}
      role={role}
      aria-label={ariaLabel}>
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  CalendarIcon: (props: Record<string, unknown>) => (
    <svg
      data-testid="calendar-icon"
      aria-hidden="true"
      {...props}
    />
  ),
}));

describe('TaskDueDatePicker', () => {
  const mockHandleDateSelect = vi.fn();
  const mockHandleDateRemove = vi.fn();

  interface RenderOptions {
    dueDate?: Date | null;
    disabled?: boolean;
  }

  const renderComponent = ({ dueDate = null, disabled = false }: RenderOptions = {}) => {
    return render(
      <TaskDueDatePicker
        dueDate={dueDate}
        disabled={disabled}
        handleDateSelect={mockHandleDateSelect}
        handleDateRemove={mockHandleDateRemove}
      />
    );
  };

  const getContainer = () => screen.getByLabelText('Due date selector');
  const getTriggerButton = () => screen.getByRole('button', { name: /due date/i });
  const getRemoveButton = () => screen.queryByTestId('remove-date-button');
  const getCalendar = () => screen.queryByTestId('calendar');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render container with trigger button and correct attributes', () => {
      renderComponent();

      expect(getContainer()).toBeInTheDocument();
      expect(getContainer()).toHaveClass('max-w-max rounded-md ring-1 ring-border');

      const button = getTriggerButton();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-size', 'sm');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-controls', 'due-date-calendar');
    });

    it('should render calendar icon', () => {
      renderComponent();

      const icon = screen.getByTestId('calendar-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should display "Due date" text when no date selected', () => {
      renderComponent({ dueDate: null });

      expect(screen.getByText('Due date')).toBeInTheDocument();
    });

    it('should display formatted date when date is selected', () => {
      const dueDate = new Date('2025-12-31');
      renderComponent({ dueDate });

      expect(screen.getByText('Dec 31')).toBeInTheDocument();
    });
  });

  describe('popover structure', () => {
    it('should render popover with content and correct attributes', () => {
      renderComponent();

      expect(screen.getByTestId('popover')).toBeInTheDocument();
      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('id', 'due-date-calendar');
      expect(content).toHaveAttribute('role', 'dialog');
      expect(content).toHaveAttribute('aria-label', 'Select due date');
      expect(content).toHaveClass('w-auto p-0');
    });
  });

  describe('calendar configuration', () => {
    it('should render calendar with correct props', () => {
      renderComponent();

      const calendar = getCalendar();
      expect(calendar).toBeInTheDocument();
      expect(calendar).toHaveAttribute('data-mode', 'single');
      expect(calendar).toHaveAttribute('data-auto-focus', 'true');
    });

    it('should pass selected date to calendar when date exists', () => {
      const dueDate = new Date('2025-12-31');
      renderComponent({ dueDate });

      expect(getCalendar()).toHaveAttribute('data-selected', dueDate.toISOString());
    });

    it('should not pass selected date when no date exists', () => {
      renderComponent({ dueDate: null });

      expect(getCalendar()).toHaveAttribute('data-selected', 'undefined');
    });
  });

  describe('date selection', () => {
    it('should call handleDateSelect and close popover when date is selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Select Date'));

      expect(mockHandleDateSelect).toHaveBeenCalledWith(new Date('2025-12-31'));
      expect(mockHandleDateSelect).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove date button', () => {
    it('should show RemoveDueDateButton when date exists', () => {
      renderComponent({ dueDate: new Date('2025-12-31') });

      expect(getRemoveButton()).toBeInTheDocument();
    });

    it('should not show RemoveDueDateButton when no date exists', () => {
      renderComponent({ dueDate: null });

      expect(getRemoveButton()).not.toBeInTheDocument();
    });

    it('should call handleDateRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ dueDate: new Date('2025-12-31') });

      await user.click(getRemoveButton()!);

      expect(mockHandleDateRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled state', () => {
    it('should disable trigger button when disabled prop is true', () => {
      renderComponent({ disabled: true });

      expect(getTriggerButton()).toBeDisabled();
    });

    it('should enable trigger button when disabled prop is false', () => {
      renderComponent({ disabled: false });

      expect(getTriggerButton()).not.toBeDisabled();
    });
  });

  describe('popover interactions', () => {
    it('should call setIsOpen when popover trigger is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getTriggerButton());

      expect(mockSetIsOpen).toHaveBeenCalled();
    });
  });
});
