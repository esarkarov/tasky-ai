import { createMockTask, createMockTasksLoaderData } from '@/core/test-setup/factories';
import { Task } from '@/features/tasks/types';
import { InboxPage } from '@/pages/InboxPage/InboxPage';
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
  PageTitle: ({ children }: { children: React.ReactNode }) => <h1 id="inbox-page-title">{children}</h1>,
}));

vi.mock('@/shared/components/atoms/List/List', () => ({
  ItemList: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}));

vi.mock('@/shared/components/atoms/TotalCounter/TotalCounter', () => ({
  TotalCounter: ({ totalCount }: { totalCount: number }) => <span data-testid="total-counter">{totalCount}</span>,
}));

vi.mock('@/features/tasks/components/atoms/AddTaskButton/AddTaskButton', () => ({
  AddTaskButton: ({ onClick }: { onClick: () => void }) => (
    <button
      data-testid="add-task-button"
      onClick={onClick}>
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
      No tasks in inbox
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
vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => mockUseTaskMutation(),
}));

const mockUseLoadMore = vi.fn();
vi.mock('@/shared/hooks/use-load-more/use-load-more', () => ({
  useLoadMore: (tasks: Task[]) => mockUseLoadMore(tasks),
}));

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('InboxPage', () => {
  const MOCK_TASK_ID_1 = 'task-1';
  const MOCK_TASK_ID_2 = 'task-2';
  const MOCK_TASK_ID_3 = 'task-3';

  interface MockSetup {
    tasks?: Task[];
    isLoading?: boolean;
    hasMore?: boolean;
  }

  const setupMocks = ({ tasks = [createMockTask()], isLoading = false, hasMore = false }: MockSetup = {}) => {
    const mockHandleCreate = vi.fn();
    const mockHandleLoadMore = vi.fn();

    mockUseTaskMutation.mockReturnValue({
      handleCreate: mockHandleCreate,
      handleUpdate: vi.fn(),
      handleDelete: vi.fn(),
    });

    mockUseLoadMore.mockReturnValue({
      items: tasks,
      isLoading,
      hasMore,
      handleLoadMore: mockHandleLoadMore,
      getItemClassName: () => '',
      getItemStyle: () => ({}),
    });

    return { mockHandleCreate, mockHandleLoadMore };
  };

  const renderWithData = (tasks: Task[] = [createMockTask()], mockSetup: MockSetup = {}) => {
    const mockData = createMockTasksLoaderData(tasks);
    mockedUseLoaderData.mockReturnValue(mockData);
    const mocks = setupMocks({ tasks, ...mockSetup });
    render(<InboxPage />);
    return mocks;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title and list structure', () => {
      renderWithData();

      expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Inbox tasks' })).toBeInTheDocument();
    });

    it('should set document title to "Tasky AI | Inbox"', () => {
      renderWithData();

      expect(document.title).toBe('Tasky AI | Inbox');
    });

    it('should render top app bar with title and count', () => {
      const tasks = [createMockTask({ $id: MOCK_TASK_ID_1 }), createMockTask({ $id: MOCK_TASK_ID_2 })];

      renderWithData(tasks);

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('Inbox');
      expect(screen.getByTestId('top-app-bar-count')).toHaveTextContent('2');
    });
  });

  describe('task display', () => {
    it('should render all task cards with correct content', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1' }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2' }),
        createMockTask({ $id: MOCK_TASK_ID_3, content: 'Task 3' }),
      ];

      renderWithData(tasks);

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toHaveTextContent('Task 1');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_2}`)).toHaveTextContent('Task 2');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_3}`)).toHaveTextContent('Task 3');
    });

    it('should show total counter when tasks exist', () => {
      renderWithData([createMockTask()]);

      expect(screen.getByTestId('total-counter')).toHaveTextContent('1');
    });

    it('should not show total counter when no tasks exist', () => {
      renderWithData([]);

      expect(screen.queryByTestId('total-counter')).not.toBeInTheDocument();
    });

    it('should pass tasks to useLoadMore hook', () => {
      const tasks = [createMockTask({ $id: MOCK_TASK_ID_1 }), createMockTask({ $id: MOCK_TASK_ID_2 })];

      renderWithData(tasks);

      expect(mockUseLoadMore).toHaveBeenCalledWith(tasks);
    });
  });

  describe('add task', () => {
    it('should show add task button initially', () => {
      renderWithData([]);

      expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
    });

    it('should show task form when add task button is clicked', async () => {
      const user = userEvent.setup();
      renderWithData([]);

      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.queryByTestId('add-task-button')).not.toBeInTheDocument();
    });

    it('should hide form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithData([]);

      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('cancel-button'));

      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should call handleCreate when form is submitted', async () => {
      const user = userEvent.setup();
      const { mockHandleCreate } = renderWithData([]);

      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('submit-button'));

      expect(mockHandleCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    it('should show empty state with inbox variant when no tasks and form closed', () => {
      renderWithData([]);

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveAttribute('data-variant', 'inbox');
    });

    it('should not show empty state when tasks exist', () => {
      renderWithData([createMockTask()]);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should not show empty state when form is open', async () => {
      const user = userEvent.setup();
      renderWithData([]);

      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('load more', () => {
    it('should show load more button when hasMore is true', () => {
      renderWithData([createMockTask()], { hasMore: true });

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      renderWithData([createMockTask()]);

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
