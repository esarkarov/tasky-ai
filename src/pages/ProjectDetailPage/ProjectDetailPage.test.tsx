import { ProjectEntity } from '@/features/projects/types';
import { TaskEntity } from '@/features/tasks/types';
import { ProjectDetailLoaderData } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useLoaderData } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectDetailPage } from './ProjectDetailPage';

vi.mock('react-router', () => ({
  useLoaderData: vi.fn(),
}));

vi.mock('@/shared/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

vi.mock('@/shared/components/templates/PageTemplate/PageTemplate', () => ({
  PageContainer: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  PageList: ({ children, ...props }: { children: React.ReactNode }) => <ul {...props}>{children}</ul>,
  PageTitle: ({ children }: { children: React.ReactNode }) => <h1 id="project-detail-title">{children}</h1>,
}));

vi.mock('@/shared/components/atoms/List/List', () => ({
  ItemList: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}));

vi.mock('@/shared/components/atoms/TotalCounter/TotalCounter', () => ({
  TotalCounter: ({ totalCount }: { totalCount: number }) => <span data-testid="total-counter">{totalCount}</span>,
}));

vi.mock('@/features/tasks/components/atoms/AddTaskButton/AddTaskButton', () => ({
  AddTaskButton: ({ onClick, ...props }: { onClick: () => void }) => (
    <button
      data-testid="add-task-button"
      onClick={onClick}
      {...props}>
      Add Task
    </button>
  ),
}));

vi.mock('@/shared/components/organisms/AppTopBar/AppTopBar', () => ({
  AppTopBar: ({ title, totalCount }: { title: string; totalCount: number }) => (
    <div data-testid="top-app-bar">
      <span>{title}</span>
      <span data-testid="top-app-bar-count">{totalCount}</span>
    </div>
  ),
}));

vi.mock('@/features/projects/components/organisms/ProjectActionMenu/ProjectActionMenu', () => ({
  ProjectActionMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="project-action-menu">{children}</div>
  ),
}));

vi.mock('@/features/tasks/components/organisms/TaskCard/TaskCard', () => ({
  TaskCard: ({ id, content }: { id: string; content: string }) => <div data-testid={`task-card-${id}`}>{content}</div>,
}));

vi.mock('@/features/tasks/components/organisms/TaskForm/TaskForm', () => ({
  TaskForm: ({ handleCancel, onSubmit }: { handleCancel: () => void; onSubmit: () => void }) => (
    <form data-testid="task-form">
      <button
        type="button"
        onClick={handleCancel}
        data-testid="cancel-button">
        Cancel
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        data-testid="submit-button">
        Submit
      </button>
    </form>
  ),
}));

vi.mock('@/shared/components/organisms/EmptyStateMessage/EmptyStateMessage', () => ({
  EmptyStateMessage: ({ variant }: { variant: string }) => (
    <div
      data-testid="empty-state"
      data-variant={variant}>
      No tasks in this project
    </div>
  ),
}));

vi.mock('@/shared/components/atoms/LoadMoreButton/LoadMoreButton', () => ({
  LoadMoreButton: ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
    <button
      data-testid="load-more-button"
      onClick={onClick}
      disabled={loading}>
      {loading ? 'Loading...' : 'Load More'}
    </button>
  ),
}));

const mockUseTaskMutation = vi.fn();
vi.mock('@/features/tasks/hooks/use-task-mutation', () => ({
  useTaskMutation: () => mockUseTaskMutation(),
}));

const mockUseLoadMore = vi.fn();
vi.mock('@/shared/hooks/use-load-more/use-load-more', () => ({
  useLoadMore: (tasks: TaskEntity[]) => mockUseLoadMore(tasks),
}));

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('ProjectDetailPage', () => {
  const MOCK_PROJECT_ID = 'project-1';
  const MOCK_TASK_ID_1 = 'task-1';
  const MOCK_TASK_ID_2 = 'task-2';
  const MOCK_TASK_ID_3 = 'task-3';

  const createMockTask = (overrides?: Partial<TaskEntity>): TaskEntity => ({
    id: MOCK_TASK_ID_1,
    $id: MOCK_TASK_ID_1,
    content: 'Test task',
    completed: false,
    due_date: new Date('2024-12-31'),
    projectId: null,
    $createdAt: '2024-01-01',
    $updatedAt: '2024-01-01',
    $collectionId: 'tasks',
    $databaseId: 'db',
    $permissions: [],
    ...overrides,
  });

  const createMockProject = (overrides?: Partial<ProjectEntity>): ProjectEntity => ({
    $id: MOCK_PROJECT_ID,
    userId: 'user-1',
    name: 'Test Project',
    color_name: 'blue',
    color_hex: '#0000FF',
    tasks: [],
    $createdAt: '2024-01-01',
    $updatedAt: '2024-01-01',
    $collectionId: 'projects',
    $databaseId: 'db',
    $permissions: [],
    ...overrides,
  });

  const createMockLoaderData = (project: ProjectEntity): ProjectDetailLoaderData => ({
    project,
  });

  const setupDefaultMocks = (tasks: TaskEntity[] = [createMockTask()]) => {
    mockUseTaskMutation.mockReturnValue({
      handleCreate: vi.fn(),
      handleUpdate: vi.fn(),
      handleDelete: vi.fn(),
    });

    mockUseLoadMore.mockReturnValue({
      items: tasks,
      isLoading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      getItemClassName: () => '',
      getItemStyle: () => ({}),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render page title and structure', () => {
      const project = createMockProject({ name: 'My Project' });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      expect(screen.getByRole('heading', { name: 'My Project' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Tasks for project My Project' })).toBeInTheDocument();
    });

    it('should set document title with project name', () => {
      const project = createMockProject({ name: 'My Project' });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      expect(document.title).toBe('Tasky AI | My Project');
    });

    it('should render top app bar with project name and task count', () => {
      const tasks = [createMockTask({ $id: MOCK_TASK_ID_1 }), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const project = createMockProject({ name: 'My Project', tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<ProjectDetailPage />);

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('My Project');
      expect(screen.getByTestId('top-app-bar-count')).toHaveTextContent('2');
    });

    it('should render project action menu button', () => {
      const project = createMockProject({ name: 'My Project' });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      const actionButton = screen.getByRole('button', {
        name: 'More actions for project My Project',
      });
      expect(actionButton).toBeInTheDocument();
    });
  });

  describe('task rendering', () => {
    it('should render all incomplete tasks', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1', completed: false }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2', completed: false }),
      ];
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<ProjectDetailPage />);

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toHaveTextContent('Task 1');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_2}`)).toHaveTextContent('Task 2');
    });

    it('should filter out completed tasks', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1', completed: false }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2', completed: true }),
      ];
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([tasks[0]]);

      render(<ProjectDetailPage />);

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toBeInTheDocument();
      expect(screen.queryByTestId(`task-card-${MOCK_TASK_ID_2}`)).not.toBeInTheDocument();
    });

    it('should sort tasks by due date', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, due_date: new Date('2024-12-31') }),
        createMockTask({ $id: MOCK_TASK_ID_2, due_date: new Date('2024-12-01') }),
        createMockTask({ $id: MOCK_TASK_ID_3, due_date: null }),
      ];
      const sortedTasks = [tasks[1], tasks[0], tasks[2]];
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(sortedTasks);

      render(<ProjectDetailPage />);

      expect(mockUseLoadMore).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ $id: MOCK_TASK_ID_2 }),
          expect.objectContaining({ $id: MOCK_TASK_ID_1 }),
          expect.objectContaining({ $id: MOCK_TASK_ID_3 }),
        ])
      );
    });

    it('should show total counter when tasks exist', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<ProjectDetailPage />);

      expect(screen.getByTestId('total-counter')).toHaveTextContent('1');
    });

    it('should not show total counter when no tasks', () => {
      const project = createMockProject({ tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      expect(screen.queryByTestId('total-counter')).not.toBeInTheDocument();
    });
  });

  describe('add task functionality', () => {
    it('should show add task button when form is not visible', () => {
      const project = createMockProject({ tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should show task form when add task button is clicked', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      const addButton = screen.getByTestId('add-task-button');
      await user.click(addButton);

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    it('should hide add task button when form is visible', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      const addButton = screen.getByTestId('add-task-button');
      await user.click(addButton);

      expect(screen.queryByTestId('add-task-button')).not.toBeInTheDocument();
    });

    it('should hide form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      await user.click(screen.getByTestId('add-task-button'));
      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      await user.click(screen.getByTestId('cancel-button'));
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
    });

    it('should call handleCreateTask when form is submitted', async () => {
      const user = userEvent.setup();
      const mockHandleCreate = vi.fn();
      const project = createMockProject({ tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseTaskMutation.mockReturnValue({
        handleCreate: mockHandleCreate,
        handleUpdate: vi.fn(),
        handleDelete: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [],
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectDetailPage />);

      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('submit-button'));

      expect(mockHandleCreate).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should show empty state when no tasks and form is not visible', () => {
      const project = createMockProject({ tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toHaveAttribute('data-variant', 'project');
    });

    it('should not show empty state when tasks exist', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<ProjectDetailPage />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should not show empty state when form is visible', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('load more functionality', () => {
    it('should show load more button when hasMore is true', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
        handleUpdate: vi.fn(),
        handleDelete: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: tasks,
        isLoading: false,
        hasMore: true,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectDetailPage />);

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<ProjectDetailPage />);

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when button is clicked', async () => {
      const user = userEvent.setup();
      const tasks = [createMockTask()];
      const mockHandleLoadMore = vi.fn();
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
        handleUpdate: vi.fn(),
        handleDelete: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: tasks,
        isLoading: false,
        hasMore: true,
        handleLoadMore: mockHandleLoadMore,
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectDetailPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      expect(mockHandleLoadMore).toHaveBeenCalled();
    });

    it('should disable load more button when loading', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
        handleUpdate: vi.fn(),
        handleDelete: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: tasks,
        isLoading: true,
        hasMore: true,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectDetailPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
      expect(loadMoreButton).toHaveTextContent('Loading...');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const project = createMockProject({ name: 'My Project', tasks: [] });
      const mockData = createMockLoaderData(project);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectDetailPage />);

      expect(screen.getByRole('list', { name: 'Tasks for project My Project' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'More actions for project My Project' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add new task to this project' })).toBeInTheDocument();
    });
  });
});
