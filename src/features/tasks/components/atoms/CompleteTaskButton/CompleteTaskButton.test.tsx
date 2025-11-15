import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompleteTaskButton } from './CompleteTaskButton';
import { ReactNode } from 'react';

const mockToggleComplete = vi.fn();
vi.mock('@/features/tasks/hooks/use-task-completion', () => ({
  useTaskCompletion: () => ({
    toggleComplete: mockToggleComplete,
  }),
}));

vi.mock('@/shared/components/ui/button', () => ({
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
    className?: string;
    role: string;
    'aria-checked'?: boolean;
    'aria-label'?: string;
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
  Check: ({ className }: { className?: string }) => (
    <svg
      data-testid="check-icon"
      className={className ?? ''}
      data-has-class={!!className}
      aria-hidden="true"
    />
  ),
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('CompleteTaskButton', () => {
  const setup = async (props?: { completed?: boolean; taskId?: string }) => {
    const user = userEvent.setup();
    const taskId = props?.taskId ?? 'task-123';
    const completed = props?.completed ?? false;
    render(
      <CompleteTaskButton
        taskId={taskId}
        completed={completed}
      />
    );
    const button = screen.getByRole('checkbox');
    const icon = screen.getByTestId('check-icon');
    return { user, button, icon, taskId };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders correctly with checkbox role and proper attributes', async () => {
      const { button } = await setup();

      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('role', 'checkbox');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'outline');
      expect(button).toHaveAttribute('data-size', 'icon');
    });

    it('renders check icon inside button', async () => {
      const { icon } = await setup();
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('incomplete state', () => {
    it('sets aria-checked to false and label to “Mark task as complete”', async () => {
      await setup({ completed: false });
      const button = screen.getByRole('checkbox');
      expect(button).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByLabelText('Mark task as complete')).toBeInTheDocument();
    });

    it('renders check icon with opacity-0 and hover transition classes', async () => {
      const { icon } = await setup({ completed: false });

      expect(icon).toBeInTheDocument();
      const className = icon.getAttribute('class') || '';

      expect(className).toContain('opacity-0');
      expect(className).toContain('group-hover/button:opacity-100');
    });
  });

  describe('completed state', () => {
    it('sets aria-checked to true and label to “Mark task as incomplete”', async () => {
      await setup({ completed: true });
      const button = screen.getByRole('checkbox');
      expect(button).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByLabelText('Mark task as incomplete')).toBeInTheDocument();
    });

    it('applies visual completion indicator', async () => {
      const { icon } = await setup({ completed: true });
      expect(icon).toBeInTheDocument();
      expect(icon.getAttribute('data-has-class')).toBe('true');
    });
  });

  describe('user interactions', () => {
    it('calls toggleTaskComplete(true) when incomplete task clicked', async () => {
      const { user, button, taskId } = await setup({ completed: false });
      mockToggleComplete.mockResolvedValue(undefined);

      await user.click(button);

      await waitFor(() => {
        expect(mockToggleComplete).toHaveBeenCalledWith(taskId, true);
      });
    });

    it('calls toggleTaskComplete(false) when completed task clicked', async () => {
      const { user, button, taskId } = await setup({ completed: true });
      mockToggleComplete.mockResolvedValue(undefined);

      await user.click(button);

      await waitFor(() => {
        expect(mockToggleComplete).toHaveBeenCalledWith(taskId, false);
      });
    });
  });

  describe('accessibility', () => {
    it('is keyboard accessible with Enter and Space', async () => {
      const { user, button, taskId } = await setup({ completed: false });
      mockToggleComplete.mockResolvedValue(undefined);

      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      await waitFor(() => {
        expect(mockToggleComplete).toHaveBeenCalledWith(taskId, true);
      });
    });

    it('uses correct aria-label per completion state', async () => {
      const { rerender } = render(
        <CompleteTaskButton
          taskId="task-123"
          completed={false}
        />
      );
      expect(screen.getByLabelText('Mark task as complete')).toBeInTheDocument();

      rerender(
        <CompleteTaskButton
          taskId="task-123"
          completed
        />
      );
      expect(screen.getByLabelText('Mark task as incomplete')).toBeInTheDocument();
    });
  });
});
