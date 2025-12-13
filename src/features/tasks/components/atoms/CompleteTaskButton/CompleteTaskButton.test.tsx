import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompleteTaskButton } from './CompleteTaskButton';

const mockToggleComplete = vi.fn();

vi.mock('@/features/tasks/hooks/use-task-completion/use-task-completion', () => ({
  useTaskCompletion: () => ({
    toggleComplete: mockToggleComplete,
  }),
}));

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant: string;
  size: string;
  className?: string;
  role: string;
  'aria-checked'?: boolean;
  'aria-label'?: string;
}

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
  }: ButtonProps) => (
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
  interface RenderOptions {
    taskId?: string;
    completed?: boolean;
  }

  const renderComponent = ({ taskId = 'task-123', completed = false }: RenderOptions = {}) => {
    return render(
      <CompleteTaskButton
        taskId={taskId}
        completed={completed}
      />
    );
  };

  const getButton = () => screen.getByRole('checkbox');
  const getIcon = () => screen.getByTestId('check-icon');

  beforeEach(() => {
    vi.clearAllMocks();
    mockToggleComplete.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('should render button with correct role and attributes', () => {
      renderComponent();

      const button = getButton();
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('role', 'checkbox');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'outline');
      expect(button).toHaveAttribute('data-size', 'icon');
    });

    it('should render check icon with aria-hidden', () => {
      renderComponent();

      const icon = getIcon();
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('incomplete state', () => {
    it('should have correct aria-checked and aria-label when incomplete', () => {
      renderComponent({ completed: false });

      const button = getButton();
      expect(button).toHaveAttribute('aria-checked', 'false');
      expect(button).toHaveAttribute('aria-label', 'Mark task as complete');
    });

    it('should render icon with opacity-0 and hover transition classes when incomplete', () => {
      renderComponent({ completed: false });

      const icon = getIcon();
      const className = icon.getAttribute('class') || '';
      expect(className).toContain('opacity-0');
      expect(className).toContain('group-hover/button:opacity-100');
    });

    it('should call toggleComplete with true when incomplete task is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ taskId: 'task-456', completed: false });

      await user.click(getButton());

      await waitFor(() => {
        expect(mockToggleComplete).toHaveBeenCalledWith('task-456', true);
        expect(mockToggleComplete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('completed state', () => {
    it('should have correct aria-checked and aria-label when completed', () => {
      renderComponent({ completed: true });

      const button = getButton();
      expect(button).toHaveAttribute('aria-checked', 'true');
      expect(button).toHaveAttribute('aria-label', 'Mark task as incomplete');
    });

    it('should render icon with visual completion indicator when completed', () => {
      renderComponent({ completed: true });

      const icon = getIcon();
      expect(icon).toBeInTheDocument();
      expect(icon.getAttribute('data-has-class')).toBe('true');
    });

    it('should call toggleComplete with false when completed task is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ taskId: 'task-789', completed: true });

      await user.click(getButton());

      await waitFor(() => {
        expect(mockToggleComplete).toHaveBeenCalledWith('task-789', false);
        expect(mockToggleComplete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('keyboard interactions', () => {
    it('should toggle completion with Enter and Space keys', async () => {
      const user = userEvent.setup();
      renderComponent({ taskId: 'task-101', completed: false });

      const button = getButton();
      button.focus();

      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(mockToggleComplete).toHaveBeenCalledWith('task-101', true);
      });

      await user.keyboard(' ');
      await waitFor(() => {
        expect(mockToggleComplete).toHaveBeenCalledTimes(2);
      });
    });
  });
});
