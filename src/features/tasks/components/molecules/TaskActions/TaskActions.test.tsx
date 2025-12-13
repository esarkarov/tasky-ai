import { createMockTask } from '@/core/test-setup/factories';
import { TaskActions } from '@/features/tasks/components/molecules/TaskActions/TaskActions';
import type { Task } from '@/features/tasks/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tasks/components/atoms/EditTaskButton/EditTaskButton', () => ({
  EditTaskButton: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-label="Edit task">
      Edit
    </button>
  ),
}));

interface ConfirmationDialogProps {
  id: string;
  label: string;
  handleDelete: (id: string) => void;
  variant: string;
  title: string;
}

vi.mock('@/shared/components/molecules/ConfirmationDialog/ConfirmationDialog', () => ({
  ConfirmationDialog: ({ id, label, handleDelete, variant, title }: ConfirmationDialogProps) => (
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

  interface RenderOptions {
    task?: Task;
  }

  const renderComponent = ({ task = createMockTask() }: RenderOptions = {}) => {
    return render(
      <TaskActions
        task={task}
        handleEdit={mockHandleEdit}
      />
    );
  };

  const getContainer = () => screen.getByRole('group', { name: 'Task actions' });
  const getEditButton = () => screen.queryByLabelText('Edit task');
  const getDeleteButton = () => screen.getByTestId('confirmation-dialog');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render container with proper accessibility attributes and classes', () => {
      renderComponent();

      const container = getContainer();
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('absolute', 'right-0', 'top-1.5', 'flex', 'items-center', 'gap-1');
    });

    it('should render EditTaskButton when task is not completed', () => {
      renderComponent({ task: createMockTask({ completed: false }) });

      expect(getEditButton()).toBeInTheDocument();
    });

    it('should not render EditTaskButton when task is completed', () => {
      renderComponent({ task: createMockTask({ completed: true }) });

      expect(getEditButton()).not.toBeInTheDocument();
    });

    it('should always render ConfirmationDialog when task is not completed', () => {
      renderComponent({ task: createMockTask({ completed: false }) });

      expect(getDeleteButton()).toBeInTheDocument();
    });

    it('should always render ConfirmationDialog when task is completed', () => {
      renderComponent({ task: createMockTask({ completed: true }) });

      expect(getDeleteButton()).toBeInTheDocument();
    });
  });

  describe('ConfirmationDialog props', () => {
    it('should pass correct props to ConfirmationDialog', () => {
      renderComponent({ task: createMockTask({ id: 'task-123', content: 'My task content' }) });

      const deleteButton = getDeleteButton();
      expect(deleteButton).toHaveAttribute('data-variant', 'icon');
      expect(deleteButton).toHaveAttribute('data-title', 'Delete task?');
      expect(deleteButton).toHaveAttribute('data-label', 'My task content');
    });
  });

  describe('user interactions', () => {
    it('should call handleEdit when EditTaskButton is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ task: createMockTask({ completed: false }) });

      await user.click(getEditButton()!);

      expect(mockHandleEdit).toHaveBeenCalledTimes(1);
    });
  });
});
