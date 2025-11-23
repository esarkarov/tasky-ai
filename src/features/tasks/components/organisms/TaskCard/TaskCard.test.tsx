import { createMockProject } from '@/core/test-setup/factories';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskCard } from './TaskCard';

const mockHandleUpdate = vi.fn();
const mockCancelForm = vi.fn();
const mockOpenForm = vi.fn();

let mockUseFetcherReturn = { json: null };
let mockUseDisclosureReturn = {
  isOpen: false,
  open: mockOpenForm,
  close: mockCancelForm,
};

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

vi.mock('@/features/tasks/components/organisms/TaskItem/TaskItem', () => ({
  TaskItem: ({ task, handleEdit }: { task: { content: string; completed: boolean }; handleEdit: () => void }) => (
    <div data-testid="task-item">
      <span>{task.content}</span>
      <span>{task.completed ? 'Completed' : 'Incomplete'}</span>
      <button onClick={handleEdit}>Edit</button>
    </div>
  ),
}));

vi.mock('@/features/tasks/components/organisms/TaskForm/TaskForm', () => ({
  TaskForm: ({
    defaultValues,
    mode,
    handleCancel,
    onSubmit,
  }: {
    defaultValues: { content: string };
    mode: string;
    handleCancel: () => void;
    onSubmit: () => void;
  }) => (
    <div data-testid="task-form">
      <span>Mode: {mode}</span>
      <span>Content: {defaultValues.content}</span>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={onSubmit}>Submit</button>
    </div>
  ),
}));

describe('TaskCard', () => {
  const defaultProps = {
    id: 'task-1',
    content: 'Test task',
    completed: false,
    dueDate: null,
    project: createMockProject(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFetcherReturn = { json: null };
    mockUseDisclosureReturn = {
      isOpen: false,
      open: mockOpenForm,
      close: mockCancelForm,
    };
  });

  describe('rendering', () => {
    it('should render task item by default', () => {
      render(<TaskCard {...defaultProps} />);

      expect(screen.getByTestId('task-item')).toBeInTheDocument();
      expect(screen.getByText('Test task')).toBeInTheDocument();
    });

    it('should render with correct ARIA attributes', () => {
      render(<TaskCard {...defaultProps} />);

      const article = screen.getByRole('listitem');
      expect(article).toHaveAttribute('aria-label', 'Task: Test task');
      expect(article).toHaveAttribute('aria-checked', 'false');
    });

    it('should show completed status in ARIA when task is completed', () => {
      render(
        <TaskCard
          {...defaultProps}
          completed={true}
        />
      );

      const article = screen.getByRole('listitem');
      expect(article).toHaveAttribute('aria-checked', 'true');
    });

    it('should have displayName set', () => {
      expect(TaskCard.displayName).toBe('TaskCard');
    });
  });

  describe('edit mode toggle', () => {
    it('should show task form when edit is clicked', async () => {
      const user = userEvent.setup();

      render(<TaskCard {...defaultProps} />);

      expect(screen.getByTestId('task-item')).toBeInTheDocument();
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();

      await user.click(screen.getByText('Edit'));

      expect(mockOpenForm).toHaveBeenCalled();
    });

    it('should display task form when isOpen is true', () => {
      mockUseDisclosureReturn.isOpen = true;

      render(<TaskCard {...defaultProps} />);

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.queryByTestId('task-item')).not.toBeInTheDocument();
    });
  });

  describe('task form', () => {
    it('should pass correct props to TaskForm', () => {
      mockUseDisclosureReturn.isOpen = true;

      render(<TaskCard {...defaultProps} />);

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByText('Mode: update')).toBeInTheDocument();
      expect(screen.getByText('Content: Test task')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper article structure', () => {
      render(<TaskCard {...defaultProps} />);

      const article = screen.getByRole('listitem');
      expect(article).toHaveClass('task-card');
    });

    it('should update aria-label with task content', () => {
      render(
        <TaskCard
          {...defaultProps}
          content="Buy groceries"
        />
      );

      const article = screen.getByRole('listitem');
      expect(article).toHaveAttribute('aria-label', 'Task: Buy groceries');
    });
  });
});
