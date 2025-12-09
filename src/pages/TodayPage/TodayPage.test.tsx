import { createMockProjectsWithTasksLoaderData, createMockTask } from '@/core/test-setup/factories';
import { Task } from '@/features/tasks/types';
import { TodayPage } from '@/pages/TodayPage/TodayPage';
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
    const mockHandleCreate = vi.fn();

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

    mockUseTaskMutation.mockReturnValue({
      handleCreate: mockHandleCreate,
    });

    return { mockSetFilterValue, mockHandleLoadMore, mockHandleCreate };
  };

  const renderWithData = (tasks: Task[] = [createMockTask()], mockSetup: MockSetup = {}) => {
    const mockData = createMockProjectsWithTasksLoaderData(tasks);
    mockedUseLoaderData.mockReturnValue(mockData);
    const mocks = setupMocks({ filteredTasks: tasks, ...mockSetup });
    render(<TodayPage />);
    return mocks;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title and list structure', () => {
      renderWithData();

      expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: "Today's tasks" })).toBeInTheDocument();
    });

    it('should set document title to "Tasky AI | Today"', () => {
      renderWithData();

      expect(document.title).toBe('Tasky AI | Today');
    });

    it('should render top app bar with title and task count', () => {
      const tasks = [createMockTask(), createMockTask({ $id: MOCK_TASK_ID_2 })];

      renderWithData(tasks);

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('Today');
      expect(topAppBar).toHaveTextContent('2');
    });

    it('should render add task button with correct aria-label', () => {
      renderWithData();

      expect(screen.getByLabelText('Add new task for today')).toBeInTheDocument();
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

      expect(screen.queryByTestId('total-counter')).not.toBeInTheDocument();
    });
  });

  describe('Add Task', () => {
    it('should show add task button initially', () => {
      renderWithData();

      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should show task form when add button is clicked', async () => {
      const user = userEvent.setup();
      renderWithData();

      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.queryByTestId('add-task-button')).not.toBeInTheDocument();
    });

    it('should hide form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithData();

      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('cancel-button'));

      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should call handleCreate when form is submitted', async () => {
      const user = userEvent.setup();
      const { mockHandleCreate } = renderWithData();

      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('submit-button'));

      expect(mockHandleCreate).toHaveBeenCalledWith({ content: 'New task' });
    });

    it('should hide empty state when form is open', async () => {
      const user = userEvent.setup();
      renderWithData([], { filteredTasks: [] });

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
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

  describe('Empty State', () => {
    it('should show empty state when no filtered tasks and form closed', () => {
      renderWithData([createMockTask()], { filteredTasks: [] });

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
