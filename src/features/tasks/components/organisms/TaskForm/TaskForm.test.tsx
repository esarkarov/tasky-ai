import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskForm } from './TaskForm';
import { TaskFormInput } from '@/features/tasks/types';
import { Project } from '@/features/projects/types';
import { CrudMode } from '@/shared/types';

const mockHandleCancel = vi.fn();
const mockHandleSubmit = vi.fn();
const mockSetContent = vi.fn();
const mockSetDueDate = vi.fn();
const mockRemoveDueDate = vi.fn();
const mockHandleProjectChange = vi.fn();

let mockIsLoading = false;
let compositeState = {
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
};

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
  {
    $id: 'proj-2',
    name: 'Personal',
    color_hex: '#00FF00',
    color_name: 'green',
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
    projects: {
      documents: mockProjects,
    },
  }),
}));

vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => {
    return {
      isLoading: mockIsLoading,
    };
  },
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
  TaskDueDatePicker: ({
    dueDate,
    handleDateSelect,
    handleDateRemove,
    disabled,
  }: {
    dueDate: Date | null;
    handleDateSelect: (date: Date) => void;
    handleDateRemove: () => void;
    disabled: boolean;
  }) => (
    <div data-testid="task-due-date-picker">
      <span>{dueDate ? dueDate.toISOString() : 'No date'}</span>
      <button
        onClick={() => handleDateSelect(new Date('2024-12-31'))}
        disabled={disabled}
        data-testid="select-date-button">
        Select Date
      </button>
      <button
        onClick={handleDateRemove}
        disabled={disabled}
        data-testid="remove-date-button">
        Remove Date
      </button>
    </div>
  ),
}));

vi.mock('@/features/projects/components/molecules/ProjectPicker/ProjectPicker', () => ({
  ProjectPicker: ({
    value,
    onValueChange,
    projects,
    disabled,
  }: {
    value: Project | null;
    onValueChange: (project: Project) => void;
    projects: Project[];
    disabled: boolean;
  }) => (
    <div data-testid="project-picker">
      <span data-testid="selected-project">{value ? value.name : 'No project'}</span>
      {projects.map((project) => (
        <button
          key={project.$id}
          onClick={() => onValueChange(project)}
          disabled={disabled}
          data-testid={`select-project-${project.name.toLowerCase()}`}>
          Select {project.name}
        </button>
      ))}
    </div>
  ),
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

describe('TaskForm', () => {
  const defaultProps = {
    mode: 'create' as CrudMode,
    handleCancel: mockHandleCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    compositeState = {
      ...compositeState,
      content: '',
      dueDate: null,
      selectedProject: null,
      isSubmitting: false,
      isValid: true,
    };
  });

  describe('rendering', () => {
    it('renders all form components', () => {
      render(<TaskForm {...defaultProps} />);

      expect(screen.getByTestId('task-content-input')).toBeInTheDocument();
      expect(screen.getByTestId('task-due-date-picker')).toBeInTheDocument();
      expect(screen.getByTestId('project-picker')).toBeInTheDocument();
      expect(screen.getByTestId('task-form-actions')).toBeInTheDocument();
    });

    it('displays correct mode title', () => {
      render(
        <TaskForm
          {...defaultProps}
          mode="create"
        />
      );
      expect(screen.getByText('Create task')).toBeInTheDocument();
    });
  });

  describe('default values', () => {
    it('renders with empty content', () => {
      render(<TaskForm {...defaultProps} />);
      expect(screen.getByTestId('task-content-input')).toHaveValue('');
    });

    it('renders provided default content', () => {
      compositeState.content = 'Buy milk';

      render(
        <TaskForm
          {...defaultProps}
          defaultValues={{ content: 'Buy milk' } as TaskFormInput}
        />
      );
      expect(screen.getByTestId('task-content-input')).toHaveValue('Buy milk');
    });
  });

  describe('user Interactions', () => {
    it('updates content', async () => {
      const user = userEvent.setup();
      render(<TaskForm {...defaultProps} />);

      await user.type(screen.getByTestId('task-content-input'), 'A');
      expect(mockSetContent).toHaveBeenCalledWith('A');
    });

    it('submits form', async () => {
      const user = userEvent.setup();

      compositeState.isValid = false;
      render(<TaskForm {...defaultProps} />);

      await user.click(screen.getByTestId('submit-button'));
      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it('cancels form', async () => {
      const user = userEvent.setup();

      compositeState.isValid = false;
      render(<TaskForm {...defaultProps} />);

      await user.click(screen.getByTestId('cancel-button'));
      expect(mockHandleCancel).toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('disables UI when loading', () => {
      mockIsLoading = true;

      render(<TaskForm {...defaultProps} />);

      expect(screen.getByTestId('task-content-input')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toBeDisabled();
    });
  });

  describe('form validation', () => {
    it('disables submit when invalid', () => {
      compositeState.isValid = true;

      render(<TaskForm {...defaultProps} />);
      expect(screen.getByTestId('submit-button')).toBeDisabled();
    });

    it('enables submit when valid', () => {
      compositeState.isValid = false;

      render(<TaskForm {...defaultProps} />);
      expect(screen.getByTestId('submit-button')).not.toBeDisabled();
    });
  });

  describe('custom props', () => {
    it('applies custom className', () => {
      render(
        <TaskForm
          {...defaultProps}
          className="custom"
        />
      );

      expect(screen.getByRole('form')).toHaveClass('custom');
    });
  });
});
