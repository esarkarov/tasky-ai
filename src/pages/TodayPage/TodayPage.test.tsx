import { Project } from '@/features/projects/types';
import { Task } from '@/features/tasks/types';
import { ProjectsWithTasksLoaderData } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useLoaderData } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodayPage } from './TodayPage';

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
  PageTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

vi.mock('@/shared/components/atoms/List/List', () => ({
  ItemList: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}));

vi.mock('@/shared/components/atoms/TotalCounter/TotalCounter', () => ({
  TotalCounter: ({ totalCount }: { totalCount: number }) => <span data-testid="total-counter">{totalCount}</span>,
}));

vi.mock('@/shared/components/organisms/AppTopBar/AppTopBar', () => ({
  AppTopBar: ({ title, totalCount }: { title: string; totalCount: number }) => (
    <div data-testid="top-app-bar">
      <span>{title}</span>
      <span>{totalCount}</span>
    </div>
  ),
}));

vi.mock('@/shared/components/organisms/FilterSelect/FilterSelect', () => ({
  FilterSelect: ({ value, handleValueChange }: { value: string; handleValueChange: (v: string) => void }) => (
    <select
      data-testid="filter-select"
      value={value}
      onChange={(e) => handleValueChange(e.target.value)}>
      <option value="">All Projects</option>
      <option value="project-1">Project 1</option>
    </select>
  ),
}));

vi.mock('@/features/tasks/components/organisms/TaskCard/TaskCard', () => ({
  TaskCard: ({ id, content }: { id: string; content: string }) => <div data-testid={`task-card-${id}`}>{content}</div>,
}));

vi.mock('@/shared/components/organisms/EmptyStateMessage/EmptyStateMessage', () => ({
  EmptyStateMessage: () => <div data-testid="empty-state">No tasks for today</div>,
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

vi.mock('@/features/tasks/components/organisms/TaskForm/TaskForm', () => ({
  TaskForm: ({ handleCancel, onSubmit }: { handleCancel: () => void; onSubmit: (data: unknown) => void }) => (
    <form data-testid="task-form">
      <input
        data-testid="task-input"
        placeholder="Task content"
      />
      <button
        type="button"
        data-testid="cancel-button"
        onClick={handleCancel}>
        Cancel
      </button>
      <button
        type="submit"
        data-testid="submit-button"
        onClick={() => onSubmit({ content: 'New task' })}>
        Submit
      </button>
    </form>
  ),
}));

const mockUseProjectFilter = vi.fn();
vi.mock('@/features/projects/hooks/use-project-filter/use-project-filter', () => ({
  useProjectFilter: () => mockUseProjectFilter(),
}));

const mockUseLoadMore = vi.fn();
vi.mock('@/shared/hooks/use-load-more/use-load-more', () => ({
  useLoadMore: (tasks: Task[]) => mockUseLoadMore(tasks),
}));

const mockUseTaskMutation = vi.fn();
vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => mockUseTaskMutation(),
}));

vi.mock('date-fns', () => ({
  startOfToday: vi.fn(() => new Date('2024-01-01T00:00:00.000Z')),
}));

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('TodayPage', () => {
  const MOCK_PROJECT_ID = 'project-1';
  const MOCK_TASK_ID_1 = 'task-1';
  const MOCK_TASK_ID_2 = 'task-2';

  const createMockTask = (overrides?: Partial<Task>): Task => ({
    id: MOCK_TASK_ID_1,
    $id: MOCK_TASK_ID_1,
    content: 'Test task',
    completed: false,
    due_date: new Date('2024-01-01'),
    projectId: null,
    $createdAt: '2024-01-01',
    $updatedAt: '2024-01-01',
    $collectionId: 'tasks',
    $databaseId: 'db',
    $permissions: [],
    ...overrides,
  });

  const createMockProject = (overrides?: Partial<Project>): Project => ({
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

  const createMockLoaderData = (
    tasks: Task[] = [createMockTask()],
    projects: Project[] = [createMockProject()]
  ): ProjectsWithTasksLoaderData => ({
    tasks: {
      documents: tasks,
      total: tasks.length,
    },
    projects: {
      documents: projects,
      total: projects.length,
    },
  });

  const setupDefaultMocks = (tasks: Task[] = [createMockTask()]) => {
    mockUseProjectFilter.mockReturnValue({
      filteredTasks: tasks,
      filteredCount: tasks.length,
      filterValue: '',
      setFilterValue: vi.fn(),
    });

    mockUseLoadMore.mockReturnValue({
      items: tasks,
      isLoading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      getItemClassName: () => '',
      getItemStyle: () => ({}),
    });

    mockUseTaskMutation.mockReturnValue({
      handleCreate: vi.fn(),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render page title and structure', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);

      expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: "Today's tasks" })).toBeInTheDocument();
    });

    it('should set document title', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);

      expect(document.title).toBe('Tasky AI | Today');
    });

    it('should render top app bar with correct props', () => {
      const tasks = [createMockTask(), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<TodayPage />);

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('Today');
      expect(topAppBar).toHaveTextContent('2');
    });
  });

  describe('task rendering', () => {
    it('should render all tasks', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1' }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2' }),
      ];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<TodayPage />);

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toHaveTextContent('Task 1');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_2}`)).toHaveTextContent('Task 2');
    });

    it('should show total counter when tasks exist', () => {
      const mockData = createMockLoaderData([createMockTask()]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([createMockTask()]);

      render(<TodayPage />);

      expect(screen.getByTestId('total-counter')).toHaveTextContent('1');
    });

    it('should not show total counter when no tasks', () => {
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<TodayPage />);

      expect(screen.queryByTestId('total-counter')).not.toBeInTheDocument();
    });
  });

  describe('add task functionality', () => {
    it('should show add task button by default', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);

      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should open task form when add button is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);
      const addButton = screen.getByTestId('add-task-button');
      await user.click(addButton);

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.queryByTestId('add-task-button')).not.toBeInTheDocument();
    });

    it('should close form when cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);
      await user.click(screen.getByTestId('add-task-button'));
      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should call handleCreateTask when form is submitted', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData();
      const mockHandleCreate = vi.fn();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectFilter.mockReturnValue({
        filteredTasks: [createMockTask()],
        filteredCount: 1,
        filterValue: '',
        setFilterValue: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockTask()],
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      mockUseTaskMutation.mockReturnValue({
        handleCreate: mockHandleCreate,
      });

      render(<TodayPage />);
      await user.click(screen.getByTestId('add-task-button'));
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockHandleCreate).toHaveBeenCalledWith({ content: 'New task' });
    });

    it('should hide empty state when form is open', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectFilter.mockReturnValue({
        filteredTasks: [],
        filteredCount: 0,
        filterValue: '',
        setFilterValue: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [],
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
      });

      render(<TodayPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();

      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('should render filter select', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);

      expect(screen.getByTestId('filter-select')).toBeInTheDocument();
    });

    it('should pass filtered tasks to load more hook', () => {
      const allTasks = [createMockTask(), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const filteredTasks = [createMockTask()];
      const mockData = createMockLoaderData(allTasks);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectFilter.mockReturnValue({
        filteredTasks,
        filteredCount: filteredTasks.length,
        filterValue: MOCK_PROJECT_ID,
        setFilterValue: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: filteredTasks,
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
      });

      render(<TodayPage />);

      expect(mockUseLoadMore).toHaveBeenCalledWith(filteredTasks);
    });

    it('should handle filter value changes', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData();
      const mockSetValue = vi.fn();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectFilter.mockReturnValue({
        filteredTasks: [createMockTask()],
        filteredCount: 1,
        filterValue: '',
        setFilterValue: mockSetValue,
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockTask()],
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
      });

      render(<TodayPage />);
      const filterSelect = screen.getByTestId('filter-select');
      await user.selectOptions(filterSelect, MOCK_PROJECT_ID);

      expect(mockSetValue).toHaveBeenCalledWith(MOCK_PROJECT_ID);
    });
  });

  describe('empty state', () => {
    it('should show empty state when no filtered tasks and form is closed', () => {
      const mockData = createMockLoaderData([createMockTask()]);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectFilter.mockReturnValue({
        filteredTasks: [],
        filteredCount: 0,
        filterValue: '',
        setFilterValue: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [],
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
      });

      render(<TodayPage />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should not show empty state when tasks exist', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('load more functionality', () => {
    it('should show load more button when hasMore is true', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectFilter.mockReturnValue({
        filteredTasks: [createMockTask()],
        filteredCount: 1,
        filterValue: '',
        setFilterValue: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockTask()],
        isLoading: false,
        hasMore: true,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
      });

      render(<TodayPage />);

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when button is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData();
      const mockHandleLoadMore = vi.fn();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectFilter.mockReturnValue({
        filteredTasks: [createMockTask()],
        filteredCount: 1,
        filterValue: '',
        setFilterValue: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockTask()],
        isLoading: false,
        hasMore: true,
        handleLoadMore: mockHandleLoadMore,
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
      });

      render(<TodayPage />);
      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      expect(mockHandleLoadMore).toHaveBeenCalled();
    });

    it('should disable load more button when loading', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectFilter.mockReturnValue({
        filteredTasks: [createMockTask()],
        filteredCount: 1,
        filterValue: '',
        setFilterValue: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockTask()],
        isLoading: true,
        hasMore: true,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      mockUseTaskMutation.mockReturnValue({
        handleCreate: vi.fn(),
      });

      render(<TodayPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
      expect(loadMoreButton).toHaveTextContent('Loading...');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);

      expect(screen.getByRole('list', { name: "Today's tasks" })).toBeInTheDocument();
    });

    it('should have accessible add task button', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<TodayPage />);

      expect(screen.getByLabelText('Add new task for today')).toBeInTheDocument();
    });
  });
});
