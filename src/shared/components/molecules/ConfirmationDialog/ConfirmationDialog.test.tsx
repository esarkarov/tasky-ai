import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ReactNode } from 'react';

const mockIsLoading = vi.fn(() => false);
vi.mock('@/features/tasks/hooks/use-task-mutation', () => ({
  useTaskMutation: () => ({
    isLoading: mockIsLoading(),
  }),
}));

vi.mock('@/shared/components/ui/alert-dialog', () => ({
  AlertDialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="alert-dialog"
      data-open={open}>
      <div onClick={() => onOpenChange(!open)}>{children}</div>
    </div>
  ),
  AlertDialogTrigger: ({ children }: { children: ReactNode; asChild?: boolean }) => <div>{children}</div>,
  AlertDialogContent: ({
    children,
    className,
    'aria-busy': ariaBusy,
    ...rest
  }: {
    children: ReactNode;
    className?: string;
    'aria-busy'?: boolean;
  }) => (
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
  AlertDialogDescription: ({ children, id }: { children: ReactNode; id: string }) => <p id={id}>{children}</p>,
  AlertDialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({ children, disabled }: { children: ReactNode; disabled: boolean }) => (
    <button
      disabled={disabled}
      aria-label="Cancel deletion">
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick: () => void;
    disabled: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Confirm deletion">
      {children}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, disabled, ...props }: { children: ReactNode; disabled?: boolean }) => (
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

describe('ConfirmationDialog', () => {
  const mockHandleDelete = vi.fn();
  const defaultProps = {
    id: 'task-1',
    label: 'Test Task',
    title: 'Delete Task',
    variant: 'icon' as const,
    handleDelete: mockHandleDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.mockReturnValue(false);
  });

  describe('basic rendering', () => {
    it('should render icon variant trigger button', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render menu variant with label', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          variant="menu-item"
        />
      );

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons[0]).toBeInTheDocument();
    });

    it('should display dialog title', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('Delete Task')).toBeInTheDocument();
    });

    it('should display truncated label in description', () => {
      const longLabel = 'A'.repeat(60);
      render(
        <ConfirmationDialog
          {...defaultProps}
          label={longLabel}
        />
      );

      expect(screen.getByText(/will be permanently deleted/i).textContent).toContain('...');
    });

    it('should display full label when under limit', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          label="Short"
        />
      );

      expect(screen.getByText("The 'Short' will be permanently deleted.")).toBeInTheDocument();
    });

    it('should show tooltip only for icon variant', () => {
      const { rerender } = render(
        <ConfirmationDialog
          {...defaultProps}
          variant="icon"
        />
      );
      expect(screen.getByText('Delete task')).toBeInTheDocument();

      rerender(
        <ConfirmationDialog
          {...defaultProps}
          variant="menu-item"
        />
      );
      expect(screen.queryByText('Delete task')).not.toBeInTheDocument();
    });
  });

  describe('dialog interaction', () => {
    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'true');
    });

    it('should close dialog after successful deletion', async () => {
      const user = userEvent.setup();
      mockHandleDelete.mockResolvedValue(undefined);
      render(<ConfirmationDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
      });
    });
  });

  describe('delete functionality', () => {
    it('should call handleDelete with correct id', async () => {
      const user = userEvent.setup();
      mockHandleDelete.mockResolvedValue(undefined);
      render(<ConfirmationDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      await waitFor(() => {
        expect(mockHandleDelete).toHaveBeenCalledWith('task-1', 'Test Task');
        expect(mockHandleDelete).toHaveBeenCalledTimes(1);
      });
    });

    it('should prevent multiple simultaneous deletions', async () => {
      const user = userEvent.setup();
      mockHandleDelete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<ConfirmationDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });

      await user.dblClick(confirmButton);
      await user.click(confirmButton);

      await waitFor(() => expect(mockHandleDelete).toHaveBeenCalledTimes(1), {
        timeout: 200,
      });
    });

    it('should reset state after deletion error', async () => {
      const user = userEvent.setup();
      mockHandleDelete.mockRejectedValue(new Error('Delete failed'));
      render(<ConfirmationDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      await waitFor(() => {
        expect(screen.queryByText('Deleting...')).not.toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('should show loading text and disable buttons during deletion', async () => {
      const user = userEvent.setup();
      mockHandleDelete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<ConfirmationDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel deletion/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /confirm deletion/i })).toBeDisabled();
    });

    it('should apply pending styles to dialog content', async () => {
      const user = userEvent.setup();
      mockHandleDelete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<ConfirmationDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm deletion/i }));

      const content = screen.getByTestId('alert-content');
      expect(content).toHaveClass('opacity-60', 'pointer-events-none', 'transition-opacity');
      expect(content).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('disabled state', () => {
    it('should disable trigger when disabled prop is true', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          disabled={true}
        />
      );

      expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    });

    it('should disable trigger when formState is pending', () => {
      mockIsLoading.mockReturnValue(true);
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    });

    it('should not open dialog when disabled', async () => {
      const user = userEvent.setup();
      render(
        <ConfirmationDialog
          {...defaultProps}
          disabled={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByLabelText('Delete')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel deletion')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm deletion')).toBeInTheDocument();
    });

    it('should have aria-describedby on dialog content', () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);

      expect(container.querySelector('[aria-describedby="delete-description"]')).toBeInTheDocument();
    });

    it('should have correct id on description', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByText(/will be permanently deleted/i)).toHaveAttribute('id', 'delete-description');
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty label', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          label=""
        />
      );

      expect(screen.getByText("The '' will be permanently deleted.")).toBeInTheDocument();
    });

    it('should handle special characters in label', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          label="Task & Test <>"
        />
      );

      expect(screen.getByText("The 'Task & Test <>' will be permanently deleted.")).toBeInTheDocument();
    });
  });
});
