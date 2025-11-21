import { createMockTask } from '@/core/tests/factories';
import { Task } from '@/features/tasks/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskActions } from './TaskActions';

vi.mock('@/features/tasks/components/atoms/EditTaskButton/EditTaskButton', () => ({
  EditTaskButton: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-label="Edit task">
      Edit
    </button>
  ),
}));

vi.mock('@/shared/components/molecules/ConfirmationDialog/ConfirmationDialog', () => ({
  ConfirmationDialog: ({
    id,
    label,
    handleDelete,
    variant,
    title,
  }: {
    id: string;
    label: string;
    handleDelete: (id: string) => void;
    variant: string;
    title: string;
  }) => (
    <button
      onClick={() => handleDelete(id)}
      aria-label="Delete task"
      data-testid="confirmation-dialog"
      data-variant={variant}
      data-title={title}
      data-label={label}>
      Delete
    </button>
  ),
}));

vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => ({
    handleDelete: vi.fn(),
  }),
}));

describe('TaskActions', () => {
  const mockHandleEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (task: Task) => {
    return render(
      <TaskActions
        task={task}
        handleEdit={mockHandleEdit}
      />
    );
  };

  describe('basic rendering', () => {
    it('should render the actions container with proper accessibility attributes', () => {
      const task = createMockTask();
      renderComponent(task);
      const container = screen.getByRole('group', { name: 'Task actions' });

      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('absolute', 'right-0', 'top-1.5', 'flex', 'items-center', 'gap-1');
    });

    it('should render EditTaskButton when task is not completed', () => {
      const task = createMockTask({ completed: false });
      renderComponent(task);
      const editButton = screen.getByLabelText('Edit task');

      expect(editButton).toBeInTheDocument();
    });

    it('should not render EditTaskButton when task is completed', () => {
      const task = createMockTask({ completed: true });
      renderComponent(task);
      const editButton = screen.queryByLabelText('Edit task');

      expect(editButton).not.toBeInTheDocument();
    });

    it('should always render ConfirmationDialog regardless of completion status', () => {
      const task = createMockTask({ completed: false });
      renderComponent(task);
      const deleteButton = screen.getByTestId('confirmation-dialog');

      expect(deleteButton).toBeInTheDocument();
    });

    it('should render ConfirmationDialog even for completed tasks', () => {
      const task = createMockTask({ completed: true });
      renderComponent(task);
      const deleteButton = screen.getByTestId('confirmation-dialog');

      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('ConfirmationDialog props', () => {
    it('should pass correct props to ConfirmationDialog', () => {
      const task = createMockTask({
        id: 'task-123',
        content: 'My task content',
      });
      renderComponent(task);
      const deleteButton = screen.getByTestId('confirmation-dialog');

      expect(deleteButton).toHaveAttribute('data-variant', 'icon');
      expect(deleteButton).toHaveAttribute('data-title', 'Delete task?');
      expect(deleteButton).toHaveAttribute('data-label', 'My task content');
    });
  });

  describe('user interactions', () => {
    it('should call handleEdit when EditTaskButton is clicked', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ completed: false });
      renderComponent(task);
      const editButton = screen.getByLabelText('Edit task');

      await user.click(editButton);

      expect(mockHandleEdit).toHaveBeenCalledTimes(1);
    });

    it('should not allow editing completed tasks', () => {
      const task = createMockTask({ completed: true });
      renderComponent(task);
      const editButton = screen.queryByLabelText('Edit task');

      expect(editButton).not.toBeInTheDocument();

      expect(mockHandleEdit).not.toHaveBeenCalled();
    });
  });
});
