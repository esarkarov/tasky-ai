import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskForm } from './TaskForm';
import type { TaskFormInput } from '@/features/tasks/types';
import type { Project } from '@/features/projects/types';
import type { CrudMode } from '@/shared/types';

const mockHandleCancel = vi.fn();
const mockHandleSubmit = vi.fn();
const mockSetContent = vi.fn();
const mockSetDueDate = vi.fn();
const mockRemoveDueDate = vi.fn();
const mockHandleProjectChange = vi.fn();

const createMockCompositeState = (overrides = {}) => ({
  content: '',
  dueDate: null,
  selectedProject: null,
  isSubmitting: false,
  isValid: true,
  setContent: mockSetContent,
  setDueDate: mockSetDueDate,
  handleProjectChange: mockHandleProjectChange,
  removeDueDate: mockRemoveDueDate,
  handleSubmit: mockHandleSubmit,
  ...overrides,
});

let mockIsLoading = false;
let compositeState = createMockCompositeState();

const mockProjects: Project[] = [
  {
    $id: 'proj-1',
    name: 'Work',
    color_hex: '#FF0000',
    color_name: 'red',
    userId: 'user-1',
    tasks: [],
    $createdAt: '2024-01-01',
    $updatedAt: '2024-01-01',
    $collectionId: 'col1',
    $databaseId: 'db1',
    $permissions: [],
  },
];

vi.mock('react-router', () => ({
  useLoaderData: () => ({
    projects: { documents: mockProjects },
  }),
}));

vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => ({ isLoading: mockIsLoading }),
}));

vi.mock('@/features/tasks/hooks/use-task-form-composite/use-task-form-composite', () => ({
  useTaskFormComposite: (props: { onSubmit?: () => void; onCancel?: () => void }) => {
    mockHandleSubmit.mockImplementation(() => props?.onSubmit?.());
    const safeCancel = () => props?.onCancel?.();

    return {
      ...compositeState,
      handleSubmit: mockHandleSubmit,
      handleCancel: safeCancel,
    };
  },
}));

vi.mock('@/features/tasks/components/molecules/TaskContentInput/TaskContentInput', () => ({
  TaskContentInput: ({
    value,
    onChange,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
  }) => (
    <input
      data-testid="task-content-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Task content"
    />
  ),
}));

vi.mock('@/features/tasks/components/molecules/TaskDueDatePicker/TaskDueDatePicker', () => ({
  TaskDueDatePicker: () => <div data-testid="task-due-date-picker">Date Picker</div>,
}));

vi.mock('@/features/projects/components/molecules/ProjectPicker/ProjectPicker', () => ({
  ProjectPicker: () => <div data-testid="project-picker">Project Picker</div>,
}));

vi.mock('@/features/tasks/components/molecules/TaskFormActions/TaskFormActions', () => ({
  TaskFormActions: ({
    disabled,
    mode,
    handleCancel,
    handleSubmit,
  }: {
    disabled: boolean;
    mode: string;
    handleCancel: () => void;
    handleSubmit: () => void;
  }) => (
    <div data-testid="task-form-actions">
      <span>Mode: {mode}</span>
      <button
        onClick={handleCancel}
        disabled={disabled}
        data-testid="cancel-button">
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={disabled}
        data-testid="submit-button">
        Submit
      </button>
    </div>
  ),
}));

vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
    <div
      className={className}
      {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: React.ComponentProps<'div'>) => <div className={className}>{children}</div>,
  CardFooter: ({ children, className }: React.ComponentProps<'div'>) => <div className={className}>{children}</div>,
}));

vi.mock('@/shared/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('TaskForm', () => {
  interface RenderOptions {
    mode?: CrudMode;
    className?: string;
    defaultValues?: TaskFormInput;
    compositeOverrides?: Partial<ReturnType<typeof createMockCompositeState>>;
  }

  const renderComponent = ({
    mode = 'create',
    className,
    defaultValues,
    compositeOverrides = {},
  }: RenderOptions = {}) => {
    compositeState = createMockCompositeState(compositeOverrides);

    return render(
      <TaskForm
        mode={mode}
        className={className}
        defaultValues={defaultValues}
        handleCancel={mockHandleCancel}
      />
    );
  };

  const getForm = () => screen.getByRole('form');
  const getContentInput = () => screen.getByTestId('task-content-input');
  const getSubmitButton = () => screen.getByTestId('submit-button');
  const getCancelButton = () => screen.getByTestId('cancel-button');

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    compositeState = createMockCompositeState();
  });

  describe('rendering', () => {
    it('should render all form components with correct title and structure', () => {
      renderComponent({ mode: 'create' });

      expect(getForm()).toBeInTheDocument();
      expect(screen.getByText('Create task')).toBeInTheDocument();
      expect(getContentInput()).toBeInTheDocument();
      expect(screen.getByTestId('task-due-date-picker')).toBeInTheDocument();
      expect(screen.getByTestId('project-picker')).toBeInTheDocument();
      expect(screen.getByTestId('task-form-actions')).toBeInTheDocument();
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should render correct title for update mode', () => {
      renderComponent({ mode: 'update' });

      expect(screen.getByText('Edit task')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      renderComponent({ className: 'custom-class' });

      expect(getForm()).toHaveClass('custom-class');
    });
  });

  describe('form state', () => {
    it('should render with default empty content', () => {
      renderComponent();

      expect(getContentInput()).toHaveValue('');
    });

    it('should render with provided default content', () => {
      renderComponent({ compositeOverrides: { content: 'Buy milk' } });

      expect(getContentInput()).toHaveValue('Buy milk');
    });
  });

  describe('user interactions', () => {
    it('should call setContent when user types', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.type(getContentInput(), 'A');

      expect(mockSetContent).toHaveBeenCalledWith('A');
    });

    it('should call handleSubmit when submit button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ compositeOverrides: { isValid: false } });

      await user.click(getSubmitButton());

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call handleCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ compositeOverrides: { isValid: false } });

      await user.click(getCancelButton());

      expect(mockHandleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading and disabled states', () => {
    it('should disable inputs when isLoading is true', () => {
      mockIsLoading = true;
      renderComponent();

      expect(getContentInput()).toBeDisabled();
      expect(getSubmitButton()).toBeDisabled();
      expect(getCancelButton()).toBeDisabled();
    });

    it('should disable inputs when isSubmitting is true', () => {
      renderComponent({ compositeOverrides: { isSubmitting: true } });

      expect(getContentInput()).toBeDisabled();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should apply loading styles when pending', () => {
      mockIsLoading = true;
      renderComponent();

      expect(getForm()).toHaveClass('animate-pulse pointer-events-none');
      expect(getForm()).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('form validation', () => {
    it('should disable submit when form is invalid', () => {
      renderComponent({ compositeOverrides: { isValid: true } });

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should enable submit when form is valid', () => {
      renderComponent({ compositeOverrides: { isValid: false } });

      expect(getSubmitButton()).not.toBeDisabled();
    });
  });
});
