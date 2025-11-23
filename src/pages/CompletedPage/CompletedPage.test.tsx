import { createMockProjectsWithTasksLoaderData, createMockTask } from '@/core/test-setup/factories';
import { Task } from '@/features/tasks/types';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useLoaderData } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompletedPage } from './CompletedPage';

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
  PageTitle: ({ children }: { children: React.ReactNode }) => <h1 id="completed-page-title">{children}</h1>,
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
      <span data-testid="top-app-bar-count">{totalCount}</span>
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
  EmptyStateMessage: ({ variant }: { variant: string }) => (
    <div
      data-testid="empty-state"
      data-variant={variant}>
      No completed tasks
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

const mockUseProjectFilter = vi.fn();
vi.mock('@/features/projects/hooks/use-project-filter/use-project-filter', () => ({
  useProjectFilter: ({ tasks }: { tasks: Task[] }) => mockUseProjectFilter({ tasks }),
}));

const mockUseLoadMore = vi.fn();
vi.mock('@/shared/hooks/use-load-more/use-load-more', () => ({
  useLoadMore: (tasks: Task[]) => mockUseLoadMore(tasks),
}));

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('CompletedPage', () => {
  const MOCK_PROJECT_ID = 'project-1';
  const MOCK_TASK_ID_1 = 'task-1';
  const MOCK_TASK_ID_2 = 'task-2';

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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render page title and structure', () => {
      const mockData = createMockProjectsWithTasksLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<CompletedPage />);

      expect(screen.getByRole('heading', { name: 'Completed' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Completed tasks' })).toBeInTheDocument();
    });

    it('should set document title', () => {
      const mockData = createMockProjectsWithTasksLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<CompletedPage />);

      expect(document.title).toBe('Tasky AI | Completed');
    });

    it('should render top app bar with correct props', () => {
      const tasks = [createMockTask({ $id: MOCK_TASK_ID_1 }), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const mockData = createMockProjectsWithTasksLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<CompletedPage />);

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('Completed');
      expect(screen.getByTestId('top-app-bar-count')).toHaveTextContent('2');
    });
  });

  describe('task rendering', () => {
    it('should render all tasks', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1' }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2' }),
      ];
      const mockData = createMockProjectsWithTasksLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<CompletedPage />);

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toHaveTextContent('Task 1');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_2}`)).toHaveTextContent('Task 2');
    });

    it('should show total counter when tasks exist', () => {
      const mockData = createMockProjectsWithTasksLoaderData([createMockTask()]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([createMockTask()]);

      render(<CompletedPage />);

      expect(screen.getByTestId('total-counter')).toHaveTextContent('1');
    });

    it('should not show total counter when no tasks', () => {
      const mockData = createMockProjectsWithTasksLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<CompletedPage />);

      expect(screen.queryByTestId('total-counter')).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('should render filter select', () => {
      const mockData = createMockProjectsWithTasksLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<CompletedPage />);

      expect(screen.getByTestId('filter-select')).toBeInTheDocument();
    });

    it('should pass tasks to useProjectFilter hook', () => {
      const tasks = [createMockTask(), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const mockData = createMockProjectsWithTasksLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<CompletedPage />);

      expect(mockUseProjectFilter).toHaveBeenCalledWith({ tasks });
    });

    it('should pass filtered tasks to load more hook', () => {
      const allTasks = [createMockTask(), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const filteredTasks = [createMockTask()];
      const mockData = createMockProjectsWithTasksLoaderData(allTasks);
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

      render(<CompletedPage />);

      expect(mockUseLoadMore).toHaveBeenCalledWith(filteredTasks);
    });

    it('should handle filter value changes', async () => {
      const user = userEvent.setup();
      const mockData = createMockProjectsWithTasksLoaderData();
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

      render(<CompletedPage />);

      const filterSelect = screen.getByTestId('filter-select');
      await user.selectOptions(filterSelect, MOCK_PROJECT_ID);

      expect(mockSetValue).toHaveBeenCalledWith(MOCK_PROJECT_ID);
    });
  });

  describe('empty state', () => {
    it('should show empty state when no filtered tasks', () => {
      const mockData = createMockProjectsWithTasksLoaderData([createMockTask()]);
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

      render(<CompletedPage />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toHaveAttribute('data-variant', 'completed');
    });

    it('should not show empty state when tasks exist', () => {
      const mockData = createMockProjectsWithTasksLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<CompletedPage />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('load more functionality', () => {
    it('should show load more button when hasMore is true', () => {
      const mockData = createMockProjectsWithTasksLoaderData();
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

      render(<CompletedPage />);

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      const mockData = createMockProjectsWithTasksLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<CompletedPage />);

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when button is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockProjectsWithTasksLoaderData();
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

      render(<CompletedPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      expect(mockHandleLoadMore).toHaveBeenCalled();
    });

    it('should disable load more button when loading', () => {
      const mockData = createMockProjectsWithTasksLoaderData();
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

      render(<CompletedPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
      expect(loadMoreButton).toHaveTextContent('Loading...');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockData = createMockProjectsWithTasksLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<CompletedPage />);

      expect(screen.getByRole('list', { name: 'Completed tasks' })).toBeInTheDocument();
    });
  });
});
