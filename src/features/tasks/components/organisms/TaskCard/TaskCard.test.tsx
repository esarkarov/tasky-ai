import { createMockProject } from '@/core/test-setup/factories';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskCard } from './TaskCard';

const mockHandleUpdate = vi.fn();
const mockCancelForm = vi.fn();
const mockOpenForm = vi.fn();

const createMockUseFetcher = (json = null) => ({ json });

const createMockUseDisclosure = (isOpen = false) => ({
  isOpen,
  open: mockOpenForm,
  close: mockCancelForm,
});

let mockUseFetcherReturn = createMockUseFetcher();
let mockUseDisclosureReturn = createMockUseDisclosure();

vi.mock('react-router', () => ({
  useFetcher: () => mockUseFetcherReturn,
}));

vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: ({ onSuccess }: { onSuccess?: () => void }) => {
    if (onSuccess) {
      mockCancelForm.mockImplementation(onSuccess);
    }
    return {
      handleUpdate: mockHandleUpdate,
    };
  },
}));

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => mockUseDisclosureReturn,
}));

interface TaskItemProps {
  task: { content: string; completed: boolean };
  handleEdit: () => void;
}

vi.mock('@/features/tasks/components/organisms/TaskItem/TaskItem', () => ({
  TaskItem: ({ task, handleEdit }: TaskItemProps) => (
    <div data-testid="task-item">
      <span>{task.content}</span>
      <span>{task.completed ? 'Completed' : 'Incomplete'}</span>
      <button onClick={handleEdit}>Edit</button>
    </div>
  ),
}));

interface TaskFormProps {
  defaultValues: { content: string };
  mode: string;
  handleCancel: () => void;
  onSubmit: () => void;
}

vi.mock('@/features/tasks/components/organisms/TaskForm/TaskForm', () => ({
  TaskForm: ({ defaultValues, mode, handleCancel, onSubmit }: TaskFormProps) => (
    <div data-testid="task-form">
      <span>Mode: {mode}</span>
      <span>Content: {defaultValues.content}</span>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={onSubmit}>Submit</button>
    </div>
  ),
}));

describe('TaskCard', () => {
  interface RenderOptions {
    id?: string;
    content?: string;
    completed?: boolean;
    dueDate?: Date | null;
    isOpen?: boolean;
  }

  const renderComponent = ({
    id = 'task-1',
    content = 'Test task',
    completed = false,
    dueDate = null,
    isOpen = false,
  }: RenderOptions = {}) => {
    mockUseDisclosureReturn = createMockUseDisclosure(isOpen);

    return render(
      <TaskCard
        id={id}
        content={content}
        completed={completed}
        dueDate={dueDate}
        project={createMockProject()}
      />
    );
  };

  const getArticle = () => screen.getByRole('listitem');
  const getTaskItem = () => screen.queryByTestId('task-item');
  const getTaskForm = () => screen.queryByTestId('task-form');

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFetcherReturn = createMockUseFetcher();
    mockUseDisclosureReturn = createMockUseDisclosure();
  });

  describe('rendering', () => {
    it('should render article with task item and correct ARIA attributes', () => {
      renderComponent({ content: 'Buy groceries', completed: false });

      const article = getArticle();
      expect(article).toBeInTheDocument();
      expect(article).toHaveClass('task-card');
      expect(article).toHaveAttribute('aria-label', 'Task: Buy groceries');
      expect(article).toHaveAttribute('aria-checked', 'false');

      expect(getTaskItem()).toBeInTheDocument();
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('should set aria-checked to true when task is completed', () => {
      renderComponent({ completed: true });

      expect(getArticle()).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('edit mode', () => {
    it('should show TaskItem when not in edit mode', () => {
      renderComponent({ isOpen: false });

      expect(getTaskItem()).toBeInTheDocument();
      expect(getTaskForm()).not.toBeInTheDocument();
    });

    it('should show TaskForm when in edit mode', () => {
      renderComponent({ isOpen: true });

      expect(getTaskItem()).not.toBeInTheDocument();
      expect(getTaskForm()).toBeInTheDocument();
    });

    it('should call openForm when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Edit'));

      expect(mockOpenForm).toHaveBeenCalledTimes(1);
    });

    it('should render TaskForm with correct props in edit mode', () => {
      renderComponent({ content: 'Test task', isOpen: true });

      expect(screen.getByText('Mode: update')).toBeInTheDocument();
      expect(screen.getByText('Content: Test task')).toBeInTheDocument();
    });
  });

  describe('component metadata', () => {
    it('should have displayName set correctly', () => {
      expect(TaskCard.displayName).toBe('TaskCard');
    });
  });
});
