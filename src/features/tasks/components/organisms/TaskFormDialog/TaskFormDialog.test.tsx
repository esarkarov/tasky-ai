import type { TaskFormInput } from '@/features/tasks/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskFormDialog } from './TaskFormDialog';

const mockHandleCreate = vi.fn();
const mockClose = vi.fn();

const createMockDisclosureState = (isOpen = false) => ({
  isOpen,
  setIsOpen: vi.fn(),
  close: mockClose,
  open: vi.fn(),
  toggle: vi.fn(),
});

let mockDisclosureState = createMockDisclosureState();

vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => ({
    handleCreate: mockHandleCreate,
  }),
}));

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => mockDisclosureState,
}));

interface TaskFormProps {
  defaultValues: { content: string; due_date: Date | null; projectId: string | null };
  mode: string;
  handleCancel: () => void;
  onSubmit: (data: TaskFormInput) => void;
}

vi.mock('@/features/tasks/components/organisms/TaskForm/TaskForm', () => ({
  TaskForm: ({ defaultValues, mode, handleCancel, onSubmit }: TaskFormProps) => (
    <div data-testid="task-form">
      <div data-testid="default-content">{defaultValues.content}</div>
      <div data-testid="default-due-date">{defaultValues.due_date?.toISOString() || 'null'}</div>
      <div data-testid="default-project-id">{String(defaultValues.projectId)}</div>
      <div data-testid="mode">{mode}</div>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={() => onSubmit({ content: 'Test task' } as TaskFormInput)}>Submit</button>
    </div>
  ),
}));

interface DialogContentProps {
  children: React.ReactNode;
  className: string;
  'aria-label': string;
}

// Simple passthrough mocks that don't control visibility
vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
  DialogContent: ({ children, className, 'aria-label': ariaLabel }: DialogContentProps) => (
    <div
      data-testid="dialog-content"
      className={className}
      role="dialog"
      aria-label={ariaLabel}>
      {children}
    </div>
  ),
}));

const mockUseLocation = vi.fn();
vi.mock('react-router', () => ({
  useLocation: () => mockUseLocation(),
}));

describe('TaskFormDialog', () => {
  interface RenderOptions {
    pathname?: string;
    isOpen?: boolean;
  }

  const renderComponent = ({ pathname = '/inbox', isOpen = false }: RenderOptions = {}) => {
    mockUseLocation.mockReturnValue({ pathname });
    mockDisclosureState = createMockDisclosureState(isOpen);

    return render(
      <TaskFormDialog>
        <button>Add Task</button>
      </TaskFormDialog>
    );
  };

  const getTrigger = () => screen.getByText('Add Task');
  const getDialogContent = () => screen.getByTestId('dialog-content');
  const getTaskForm = () => screen.queryByTestId('task-form');

  beforeEach(() => {
    vi.clearAllMocks();
    mockDisclosureState = createMockDisclosureState();
  });

  describe('rendering', () => {
    it('should render dialog trigger with children and dialog structure', () => {
      renderComponent();

      expect(getTrigger()).toBeInTheDocument();
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should render TaskForm with correct attributes when isOpen is true', () => {
      renderComponent({ isOpen: true });

      const dialogContent = getDialogContent();
      expect(dialogContent).toBeInTheDocument();
      expect(dialogContent).toHaveClass('p-0 border-0 !rounded-xl');
      expect(dialogContent).toHaveAttribute('role', 'dialog');
      expect(dialogContent).toHaveAttribute('aria-label', 'Create new task form');
      expect(getTaskForm()).toBeInTheDocument();
    });
  });

  describe('default values', () => {
    it('should set default values correctly when not on today route', () => {
      renderComponent({ pathname: '/inbox', isOpen: true });

      expect(screen.getByTestId('default-content')).toHaveTextContent('');
      expect(screen.getByTestId('default-due-date')).toHaveTextContent('null');
      expect(screen.getByTestId('default-project-id')).toHaveTextContent('null');
      expect(screen.getByTestId('mode')).toHaveTextContent('create');
    });

    it('should set due_date to today when on today route', () => {
      renderComponent({ pathname: '/app/today', isOpen: true });

      const dueDateText = screen.getByTestId('default-due-date').textContent!;
      expect(dueDateText).not.toBe('null');

      const renderedDate = new Date(dueDateText);
      const today = new Date();
      expect(renderedDate.toDateString()).toBe(today.toDateString());
    });
  });

  describe('user interactions', () => {
    it('should call handleCreate when form is submitted', async () => {
      const user = userEvent.setup();
      renderComponent({ isOpen: true });

      await user.click(screen.getByRole('button', { name: /submit/i }));

      expect(mockHandleCreate).toHaveBeenCalledWith({ content: 'Test task' });
      expect(mockHandleCreate).toHaveBeenCalledTimes(1);
    });

    it('should call close when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ isOpen: true });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });
});
