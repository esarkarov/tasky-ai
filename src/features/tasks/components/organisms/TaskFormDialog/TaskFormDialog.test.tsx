import type { TaskFormInput } from '@/features/tasks/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskFormDialog } from './TaskFormDialog';

const mockHandleCreate = vi.fn();
vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: vi.fn(() => ({
    handleCreate: mockHandleCreate,
  })),
}));

vi.mock('@/features/tasks/components/organisms/TaskForm/TaskForm', () => ({
  TaskForm: vi.fn(({ defaultValues, mode, handleCancel, onSubmit }) => (
    <div data-testid="task-form">
      <div data-testid="default-content">{defaultValues.content}</div>
      <div data-testid="default-due-date">{defaultValues.due_date?.toISOString() || 'null'}</div>
      <div data-testid="default-project-id">{String(defaultValues.projectId)}</div>
      <div data-testid="mode">{mode}</div>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={() => onSubmit({ content: 'Test task' } as TaskFormInput)}>Submit</button>
    </div>
  )),
}));

const mockUseLocation = vi.fn();
vi.mock('react-router', () => ({
  useLocation: () => mockUseLocation(),
}));

describe('TaskFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/inbox' });
  });

  describe('rendering', () => {
    it('renders dialog trigger with children', () => {
      render(
        <TaskFormDialog>
          <button>Add Task</button>
        </TaskFormDialog>
      );

      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    });

    it('opens dialog when trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TaskFormDialog>
          <button>Add Task</button>
        </TaskFormDialog>
      );

      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByRole('dialog', { name: /create new task form/i })).toBeInTheDocument();
    });
  });

  describe('default values', () => {
    it('sets default values correctly when not on today route', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      render(
        <TaskFormDialog>
          <button>Add Task</button>
        </TaskFormDialog>
      );

      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(screen.getByTestId('default-content')).toHaveTextContent('');
      expect(screen.getByTestId('default-due-date')).toHaveTextContent('null');
      expect(screen.getByTestId('default-project-id')).toHaveTextContent('null');
      expect(screen.getByTestId('mode')).toHaveTextContent('create');
    });

    // it('sets due_date to today when on today route', async () => {
    //   const user = userEvent.setup();
    //   mockUseLocation.mockReturnValue({ pathname: '/today' });
    //   render(
    //     <TaskFormDialog>
    //       <button>Add Task</button>
    //     </TaskFormDialog>
    //   );

    //   await user.click(screen.getByRole('button', { name: /add task/i }));
    //   await screen.findByTestId('task-form');

    //   const iso = screen.getByTestId('value-date').textContent!;
    //   const rendered = new Date(iso);

    //   const today = startOfToday();
    //   expect(rendered.toDateString()).toBe(today.toDateString());
    // });
  });

  describe('user interactions', () => {
    it('closes dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TaskFormDialog>
          <button>Add Task</button>
        </TaskFormDialog>
      );

      await user.click(screen.getByRole('button', { name: /add task/i }));
      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      });
    });

    it('calls handleCreate when form is submitted', async () => {
      const user = userEvent.setup();

      render(
        <TaskFormDialog>
          <button>Add Task</button>
        </TaskFormDialog>
      );

      await user.click(screen.getByRole('button', { name: /add task/i }));
      await user.click(screen.getByRole('button', { name: /submit/i }));

      expect(mockHandleCreate).toHaveBeenCalledWith({ content: 'Test task' });
    });

    it('can open and close dialog multiple times', async () => {
      const user = userEvent.setup();

      render(
        <TaskFormDialog>
          <button>Add Task</button>
        </TaskFormDialog>
      );

      await user.click(screen.getByRole('button', { name: /add task/i }));
      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      await waitFor(() => {
        expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /add task/i }));
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });
  });
});
