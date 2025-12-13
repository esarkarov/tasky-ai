import { ConfirmationDialog } from '@/shared/components/molecules/ConfirmationDialog/ConfirmationDialog';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const mockIsLoading = vi.fn(() => false);
vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => ({
    isLoading: mockIsLoading(),
  }),
}));

interface AlertDialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AlertDialogContentProps {
  children: ReactNode;
  className?: string;
  role?: string;
  'aria-busy'?: boolean;
  'aria-describedby'?: string;
}

interface AlertDialogDescriptionProps {
  children: ReactNode;
  id: string;
}

interface AlertDialogCancelProps {
  children: ReactNode;
  disabled: boolean;
  'aria-label'?: string;
}

interface AlertDialogActionProps {
  children: ReactNode;
  onClick: () => void;
  disabled: boolean;
  className?: string;
  'aria-label'?: string;
}

vi.mock('@/shared/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open, onOpenChange }: AlertDialogProps) => (
    <div
      data-testid="alert-dialog"
      data-open={open}>
      <div onClick={() => onOpenChange(!open)}>{children}</div>
    </div>
  ),
  AlertDialogTrigger: ({ children }: { children: ReactNode; asChild?: boolean }) => <div>{children}</div>,
  AlertDialogContent: ({ children, className, 'aria-busy': ariaBusy, ...rest }: AlertDialogContentProps) => (
    <div
      data-testid="alert-content"
      className={className}
      aria-busy={ariaBusy}
      {...rest}>
      {children}
    </div>
  ),
  AlertDialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children, id }: AlertDialogDescriptionProps) => <p id={id}>{children}</p>,
  AlertDialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({ children, disabled, 'aria-label': ariaLabel }: AlertDialogCancelProps) => (
    <button
      disabled={disabled}
      aria-label={ariaLabel}>
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, onClick, disabled, 'aria-label': ariaLabel, className }: AlertDialogActionProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}>
      {children}
    </button>
  ),
}));

interface ButtonProps {
  children: ReactNode;
  disabled?: boolean;
  variant?: string;
  size?: string;
  className?: string;
  'aria-label'?: string;
}

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, disabled, ...props }: ButtonProps) => (
    <button
      disabled={disabled}
      {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: ReactNode; asChild?: boolean }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/utils/text/text.utils', () => ({
  truncateString: (str: string, length: number) => (str.length > length ? `${str.slice(0, length)}...` : str),
}));

interface ConfirmationDialogProps {
  id: string;
  label: string;
  title: string;
  variant: 'icon' | 'menu-item';
  handleDelete: Mock;
  disabled?: boolean;
}

const defaultProps: ConfirmationDialogProps = {
  id: 'task-1',
  label: 'Test Task',
  title: 'Delete Task',
  variant: 'icon',
  handleDelete: vi.fn(),
};

const renderComponent = (props: Partial<ConfirmationDialogProps> = {}) =>
  render(<ConfirmationDialog {...{ ...defaultProps, ...props }} />);

describe('ConfirmationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.mockReturnValue(false);
  });

  describe('basic rendering', () => {
    it('should render icon variant with tooltip', () => {
      renderComponent({ variant: 'icon' });

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByText('Delete task')).toBeInTheDocument();
    });

    it('should render menu variant without tooltip', () => {
      renderComponent({ variant: 'menu-item' });

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons[0]).toBeInTheDocument();
      expect(screen.queryByText('Delete task')).not.toBeInTheDocument();
    });

    it('should display dialog title and description with truncated label', () => {
      const longLabel = 'A'.repeat(60);

      renderComponent({ label: longLabel });

      expect(screen.getByText('Delete Task')).toBeInTheDocument();
      expect(screen.getByText(/will be permanently deleted/i).textContent).toContain('...');
    });

    it('should display full label when under truncation limit', () => {
      renderComponent({ label: 'Short' });

      expect(screen.getByText("The 'Short' will be permanently deleted.")).toBeInTheDocument();
    });
  });

  describe('dialog interaction', () => {
    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'true');
    });

    it('should close dialog after successful deletion', async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn().mockResolvedValue(undefined);

      renderComponent({ handleDelete });

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
      });
    });

    it('should not open dialog when disabled', async () => {
      const user = userEvent.setup();

      renderComponent({ disabled: true });

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('delete functionality', () => {
    it('should call handleDelete with correct id and label', async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn().mockResolvedValue(undefined);

      renderComponent({ handleDelete });

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      await waitFor(() => {
        expect(handleDelete).toHaveBeenCalledWith('task-1', 'Test Task');
        expect(handleDelete).toHaveBeenCalledTimes(1);
      });
    });

    it('should prevent multiple simultaneous deletions', async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      renderComponent({ handleDelete });

      await user.click(screen.getByRole('button', { name: /delete/i }));
      const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });

      await user.dblClick(confirmButton);
      await user.click(confirmButton);

      await waitFor(() => expect(handleDelete).toHaveBeenCalledTimes(1), { timeout: 200 });
    });

    it('should reset state after deletion error', async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn().mockRejectedValue(new Error('Delete failed'));

      renderComponent({ handleDelete });

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      await waitFor(() => {
        expect(screen.queryByText('Deleting...')).not.toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('should show loading text, disable buttons, and apply pending styles during deletion', async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      renderComponent({ handleDelete });

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel deletion/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /confirm deletion/i })).toBeDisabled();

      const content = screen.getByTestId('alert-content');
      expect(content).toHaveClass('opacity-60', 'pointer-events-none', 'transition-opacity');
      expect(content).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('disabled state', () => {
    it('should disable trigger when disabled prop is true', () => {
      renderComponent({ disabled: true });

      expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    });

    it('should disable trigger when formState is pending', () => {
      mockIsLoading.mockReturnValue(true);

      renderComponent();

      expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels and attributes', () => {
      renderComponent();

      expect(screen.getByLabelText('Delete')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel deletion')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm deletion')).toBeInTheDocument();
    });

    it('should have correct aria-describedby and description id', () => {
      const { container } = renderComponent();

      expect(container.querySelector('[aria-describedby="delete-description"]')).toBeInTheDocument();
      expect(screen.getByText(/will be permanently deleted/i)).toHaveAttribute('id', 'delete-description');
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = renderComponent();

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty label', () => {
      renderComponent({ label: '' });

      expect(screen.getByText("The '' will be permanently deleted.")).toBeInTheDocument();
    });

    it('should handle special characters in label', () => {
      renderComponent({ label: 'Task & Test <>' });

      expect(screen.getByText("The 'Task & Test <>' will be permanently deleted.")).toBeInTheDocument();
    });
  });
});
