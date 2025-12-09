import { createMockProjectsWithTasksLoaderData, createMockTask } from '@/core/test-setup/factories';
import { Task } from '@/features/tasks/types';
import { UpcomingPage } from '@/pages/UpcomingPage/UpcomingPage';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useLoaderData } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  PageTitle: ({ children }: { children: React.ReactNode }) => <h1 id="page-title">{children}</h1>,
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
  EmptyStateMessage: () => <div data-testid="empty-state">No upcoming tasks</div>,
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
  useProjectFilter: () => mockUseProjectFilter(),
}));

const mockUseLoadMore = vi.fn();
vi.mock('@/shared/hooks/use-load-more/use-load-more', () => ({
  useLoadMore: (tasks: Task[]) => mockUseLoadMore(tasks),
}));

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('UpcomingPage', () => {
  const MOCK_PROJECT_ID = 'project-1';
  const MOCK_TASK_ID_1 = 'task-1';
  const MOCK_TASK_ID_2 = 'task-2';

  interface MockSetup {
    filteredTasks?: Task[];
    items?: Task[];
    isLoading?: boolean;
    hasMore?: boolean;
    filterValue?: string;
  }

  const setupMocks = ({
    filteredTasks = [createMockTask()],
    items = filteredTasks,
    isLoading = false,
    hasMore = false,
    filterValue = '',
  }: MockSetup = {}) => {
    const mockSetFilterValue = vi.fn();
    const mockHandleLoadMore = vi.fn();

    mockUseProjectFilter.mockReturnValue({
      filteredTasks,
      filteredCount: filteredTasks.length,
      filterValue,
      setFilterValue: mockSetFilterValue,
    });

    mockUseLoadMore.mockReturnValue({
      items,
      isLoading,
      hasMore,
      handleLoadMore: mockHandleLoadMore,
      getItemClassName: () => '',
      getItemStyle: () => ({}),
    });

    return { mockSetFilterValue, mockHandleLoadMore };
  };

  const renderWithData = (tasks: Task[] = [createMockTask()], mockSetup: MockSetup = {}) => {
    const mockData = createMockProjectsWithTasksLoaderData(tasks);
    mockedUseLoaderData.mockReturnValue(mockData);
    const mocks = setupMocks({ filteredTasks: tasks, ...mockSetup });
    render(<UpcomingPage />);
    return mocks;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title and list structure', () => {
      renderWithData();

      expect(screen.getByRole('heading', { name: 'Upcoming' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Upcoming tasks' })).toBeInTheDocument();
    });

    it('should set document title to "Tasky AI | Upcoming"', () => {
      renderWithData();

      expect(document.title).toBe('Tasky AI | Upcoming');
    });

    it('should render top app bar with title and task count', () => {
      const tasks = [createMockTask(), createMockTask({ $id: MOCK_TASK_ID_2 })];

      renderWithData(tasks);

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('Upcoming');
      expect(topAppBar).toHaveTextContent('2');
    });
  });

  describe('task display', () => {
    it('should render all task cards with correct content', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1' }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2' }),
      ];

      renderWithData(tasks);

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toHaveTextContent('Task 1');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_2}`)).toHaveTextContent('Task 2');
    });

    it('should show total counter when tasks exist', () => {
      renderWithData([createMockTask()]);

      expect(screen.getByTestId('total-counter')).toHaveTextContent('1');
    });

    it('should not show total counter when no tasks exist', () => {
      renderWithData([]);

      const counters = screen.queryAllByText('0');
      expect(counters.length).toBeLessThanOrEqual(1);
    });
  });

  describe('filtering', () => {
    it('should render filter select', () => {
      renderWithData();

      expect(screen.getByTestId('filter-select')).toBeInTheDocument();
    });

    it('should pass filtered tasks to useLoadMore hook', () => {
      const allTasks = [createMockTask(), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const filteredTasks = [createMockTask()];

      renderWithData(allTasks, { filteredTasks });

      expect(mockUseLoadMore).toHaveBeenCalledWith(filteredTasks);
    });

    it('should call setFilterValue when filter value changes', async () => {
      const user = userEvent.setup();
      const { mockSetFilterValue } = renderWithData();

      await user.selectOptions(screen.getByTestId('filter-select'), MOCK_PROJECT_ID);

      expect(mockSetFilterValue).toHaveBeenCalledWith(MOCK_PROJECT_ID);
    });
  });

  describe('empty state', () => {
    it('should show empty state when no filtered tasks exist', () => {
      renderWithData([createMockTask()], { filteredTasks: [], items: [] });

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should not show empty state when tasks exist', () => {
      renderWithData();

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('load more', () => {
    it('should show load more button when hasMore is true', () => {
      renderWithData([createMockTask()], { hasMore: true });

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      renderWithData();

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when load more button is clicked', async () => {
      const user = userEvent.setup();
      const { mockHandleLoadMore } = renderWithData([createMockTask()], { hasMore: true });

      await user.click(screen.getByTestId('load-more-button'));

      expect(mockHandleLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should disable load more button and show loading text when loading', () => {
      renderWithData([createMockTask()], { hasMore: true, isLoading: true });

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
      expect(loadMoreButton).toHaveTextContent('Loading...');
    });
  });
});
