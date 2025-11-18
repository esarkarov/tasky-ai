import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { TaskFormDialog } from './TaskFormDialog';
import { ROUTES } from '@/shared/constants/routes';
import { startOfToday } from 'date-fns';

const mockHandleCreate = vi.fn();
const mockClose = vi.fn();
let isOpenState = false;

vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => ({
    handleCreate: mockHandleCreate,
  }),
}));

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => ({
    isOpen: isOpenState,
    setIsOpen: vi.fn((value: boolean) => (isOpenState = value)),
    close: mockClose,
  }),
}));

vi.mock('@/features/tasks/components/organisms/TaskForm/TaskForm', () => ({
  TaskForm: ({
    defaultValues,
    handleCancel,
    onSubmit,
  }: {
    defaultValues: {
      content: string;
      due_date: Date | null;
      projectId: string | null;
    };
    handleCancel: () => void;
    onSubmit: () => void;
  }) => (
    <div>
      <div data-testid="task-form">
        <span data-testid="value-content">{defaultValues.content}</span>
        <span data-testid="value-project">{String(defaultValues.projectId)}</span>
        <span data-testid="value-date">{defaultValues.due_date ? defaultValues.due_date.toISOString() : 'null'}</span>
      </div>

      <button
        data-testid="cancel-btn"
        onClick={handleCancel}>
        Cancel
      </button>
      <button
        data-testid="submit-btn"
        onClick={onSubmit}>
        Submit
      </button>
    </div>
  ),
}));

const renderDialog = (route: string = '/') => {
  isOpenState = true;
  return render(
    <MemoryRouter initialEntries={[route]}>
      <TaskFormDialog>
        <button data-testid="trigger">Add Task</button>
      </TaskFormDialog>
    </MemoryRouter>
  );
};

describe('TaskFormDialog (comprehensive behavior tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isOpenState = true;
  });

  describe('rendering', () => {
    it('renders dialog content and TaskForm when initially open', () => {
      renderDialog();

      expect(screen.getByLabelText('Create new task form')).toBeInTheDocument();
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });
  });

  describe('default values', () => {
    it('sets due_date = today when route is TODAY', () => {
      const today = startOfToday().toISOString();
      renderDialog(ROUTES.TODAY);

      expect(screen.getByTestId('value-date')).toHaveTextContent(today);
    });

    it('sets due_date = null when route is NOT TODAY', () => {
      renderDialog('/inbox');

      expect(screen.getByTestId('value-date')).toHaveTextContent('null');
    });

    it('always sets content to empty string and projectId to null', () => {
      renderDialog();

      expect(screen.getByTestId('value-content')).toHaveTextContent('');
      expect(screen.getByTestId('value-project')).toHaveTextContent('null');
    });
  });

  describe('user interactions', () => {
    it('closes the dialog when TaskForm triggers cancel', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByTestId('cancel-btn'));

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('invokes handleCreate when TaskForm submits', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByTestId('submit-btn'));

      expect(mockHandleCreate).toHaveBeenCalledTimes(1);
    });

    it('updates dialog open state via onOpenChange (trigger clicked)', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByTestId('trigger'));

      expect(isOpenState).toBe(false);
    });

    it('keeps dialog open if no toggle interaction happens', () => {
      renderDialog();

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(isOpenState).toBe(true);
    });
  });
});
