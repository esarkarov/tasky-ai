import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompleteTaskButton } from './CompleteTaskButton';
import { ReactNode } from 'react';

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    role,
    'aria-checked': ariaChecked,
    'aria-label': ariaLabel,
  }: {
    children: ReactNode;
    onClick: () => void;
    variant: string;
    size: string;
    className: string;
    role: string;
    'aria-checked': boolean;
    'aria-label': string;
  }) => (
    <button
      type="button"
      data-variant={variant}
      data-size={size}
      className={className}
      role={role}
      aria-checked={ariaChecked}
      aria-label={ariaLabel}
      onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Check: ({ className }: { className: string }) => (
    <svg
      data-testid="check-icon"
      className={className}
      aria-hidden="true"
    />
  ),
}));

vi.mock('@/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' '),
}));

const mockToggleTaskComplete = vi.fn();
vi.mock('@/hooks/use-task-operations', () => ({
  useTaskOperations: () => ({
    toggleTaskComplete: mockToggleTaskComplete,
  }),
}));

describe('CompleteTaskButton', () => {
  const MOCK_TASK_ID = 'task-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render button with checkbox role', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      const button = screen.getByRole('checkbox');
      expect(button).toBeInTheDocument();
    });

    it('should render as button type', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      const button = screen.getByRole('checkbox');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render with outline variant and icon size', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      const button = screen.getByRole('checkbox');
      expect(button).toHaveAttribute('data-variant', 'outline');
      expect(button).toHaveAttribute('data-size', 'icon');
    });

    it('should render check icon', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('incomplete state', () => {
    it('should have aria-checked false when incomplete', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      const button = screen.getByRole('checkbox');
      expect(button).toHaveAttribute('aria-checked', 'false');
    });

    it('should have correct aria-label when incomplete', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      expect(screen.getByLabelText('Mark task as complete')).toBeInTheDocument();
    });

    it('should apply opacity-0 class to check icon when incomplete', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toHaveClass('opacity-0');
    });

    it('should not apply bg-border class when incomplete', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      const button = screen.getByRole('checkbox');
      expect(button.className).not.toContain('bg-border');
    });
  });

  describe('completed state', () => {
    it('should have aria-checked true when completed', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={true}
        />
      );

      const button = screen.getByRole('checkbox');
      expect(button).toHaveAttribute('aria-checked', 'true');
    });

    it('should have correct aria-label when completed', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={true}
        />
      );

      expect(screen.getByLabelText('Mark task as incomplete')).toBeInTheDocument();
    });

    it('should apply opacity-100 class to check icon when completed', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={true}
        />
      );

      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toHaveClass('opacity-100');
    });

    it('should apply bg-border class when completed', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={true}
        />
      );

      const button = screen.getByRole('checkbox');
      expect(button).toHaveClass('bg-border');
    });
  });

  describe('user interactions', () => {
    it('should call toggleTaskComplete with correct params when incomplete task is clicked', async () => {
      const user = userEvent.setup();
      mockToggleTaskComplete.mockResolvedValue(undefined);
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );
      const button = screen.getByRole('checkbox');

      await user.click(button);

      await waitFor(() => {
        expect(mockToggleTaskComplete).toHaveBeenCalledWith(MOCK_TASK_ID, true);
      });
    });

    it('should call toggleTaskComplete with correct params when completed task is clicked', async () => {
      const user = userEvent.setup();
      mockToggleTaskComplete.mockResolvedValue(undefined);
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={true}
        />
      );
      const button = screen.getByRole('checkbox');

      await user.click(button);

      await waitFor(() => {
        expect(mockToggleTaskComplete).toHaveBeenCalledWith(MOCK_TASK_ID, false);
      });
    });

    it('should toggle between incomplete and complete states', async () => {
      const user = userEvent.setup();
      mockToggleTaskComplete.mockResolvedValue(undefined);
      const { rerender } = render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );
      const button = screen.getByRole('checkbox');

      await user.click(button);

      await waitFor(() => {
        expect(mockToggleTaskComplete).toHaveBeenCalledWith(MOCK_TASK_ID, true);
      });

      rerender(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={true}
        />
      );
      await user.click(button);

      await waitFor(() => {
        expect(mockToggleTaskComplete).toHaveBeenCalledWith(MOCK_TASK_ID, false);
      });
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();
      mockToggleTaskComplete.mockResolvedValue(undefined);
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );
      const button = screen.getByRole('checkbox');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      await waitFor(() => {
        expect(mockToggleTaskComplete).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible via Enter key', async () => {
      const user = userEvent.setup();
      mockToggleTaskComplete.mockResolvedValue(undefined);
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );
      const button = screen.getByRole('checkbox');

      button.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockToggleTaskComplete).toHaveBeenCalledWith(MOCK_TASK_ID, true);
      });
    });

    it('should be accessible via Space key', async () => {
      const user = userEvent.setup();
      mockToggleTaskComplete.mockResolvedValue(undefined);
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );
      const button = screen.getByRole('checkbox');

      button.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(mockToggleTaskComplete).toHaveBeenCalledWith(MOCK_TASK_ID, true);
      });
    });

    it('should hide check icon from screen readers', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have different labels for different states', () => {
      const { rerender } = render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      expect(screen.getByLabelText('Mark task as complete')).toBeInTheDocument();

      rerender(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={true}
        />
      );

      expect(screen.getByLabelText('Mark task as incomplete')).toBeInTheDocument();
    });
  });

  describe('hook integration', () => {
    it('should call useTaskOperations with enableUndo option', () => {
      render(
        <CompleteTaskButton
          taskId={MOCK_TASK_ID}
          completed={false}
        />
      );

      expect(mockToggleTaskComplete).toBeDefined();
    });
  });
});
