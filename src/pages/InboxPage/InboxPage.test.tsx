import type { TasksLoaderData } from '@/types/loaders.types';
import type { TaskEntity } from '@/types/tasks.types';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InboxPage } from './InboxPage';
import { useLoaderData } from 'react-router';

vi.mock('react-router', () => ({
  useLoaderData: vi.fn(),
}));

vi.mock('@/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

vi.mock('@/components/templates/PageTemplate/PageTemplate', () => ({
  PageContainer: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  PageList: ({ children, ...props }: { children: React.ReactNode }) => <ul {...props}>{children}</ul>,
  PageTitle: ({ children }: { children: React.ReactNode }) => <h1 id="inbox-page-title">{children}</h1>,
}));

vi.mock('@/components/atoms/List/List', () => ({
  ItemList: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}));

vi.mock('@/components/atoms/TotalCounter/TotalCounter', () => ({
  TotalCounter: ({ totalCount }: { totalCount: number }) => <span data-testid="total-counter">{totalCount}</span>,
}));

vi.mock('@/components/atoms/AddTaskButton/AddTaskButton', () => ({
  AddTaskButton: ({ onClick }: { onClick: () => void }) => (
    <button
      data-testid="add-task-button"
      onClick={onClick}>
      Add Task
    </button>
  ),
}));

vi.mock('@/components/organisms/TopAppBar', () => ({
  TopAppBar: ({ title, totalCount }: { title: string; totalCount: number }) => (
    <div data-testid="top-app-bar">
      <span>{title}</span>
      <span data-testid="top-app-bar-count">{totalCount}</span>
    </div>
  ),
}));

vi.mock('@/components/organisms/TaskCard', () => ({
  TaskCard: ({ id, content }: { id: string; content: string }) => <div data-testid={`task-card-${id}`}>{content}</div>,
}));

vi.mock('@/components/organisms/TaskForm', () => ({
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

vi.mock('@/components/organisms/EmptyStateMessage', () => ({
  EmptyStateMessage: ({ variant }: { variant: string }) => (
    <div
      data-testid="empty-state"
      data-variant={variant}>
      No tasks in inbox
    </div>
  ),
}));

vi.mock('@/components/atoms/LoadMoreButton/LoadMoreButton', () => ({
  LoadMoreButton: ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
    <button
      data-testid="load-more-button"
      onClick={onClick}
      disabled={loading}>
      {loading ? 'Loading...' : 'Load More'}
    </button>
  ),
}));

const mockUseTaskOperations = vi.fn();
vi.mock('@/hooks/use-task-operations', () => ({
  useTaskOperations: () => mockUseTaskOperations(),
}));

const mockUseLoadMore = vi.fn();
vi.mock('@/hooks/use-load-more', () => ({
  useLoadMore: (tasks: TaskEntity[]) => mockUseLoadMore(tasks),
}));

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('InboxPage', () => {
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

  const createMockLoaderData = (tasks: TaskEntity[] = [createMockTask()]): TasksLoaderData => ({
    tasks: {
      documents: tasks,
      total: tasks.length,
    },
  });

  const setupDefaultMocks = (tasks: TaskEntity[] = [createMockTask()]) => {
    mockUseTaskOperations.mockReturnValue({
      handleCreateTask: vi.fn(),
      handleUpdateTask: vi.fn(),
      handleDeleteTask: vi.fn(),
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
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<InboxPage />);

      expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Inbox tasks' })).toBeInTheDocument();
    });

    it('should set document title', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<InboxPage />);

      expect(document.title).toBe('Tasky AI | Inbox');
    });

    it('should render top app bar with correct props', () => {
      const tasks = [createMockTask({ $id: MOCK_TASK_ID_1 }), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<InboxPage />);

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('Inbox');
      expect(screen.getByTestId('top-app-bar-count')).toHaveTextContent('2');
    });
  });

  describe('task rendering', () => {
    it('should render all tasks', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1' }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2' }),
        createMockTask({ $id: MOCK_TASK_ID_3, content: 'Task 3' }),
      ];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<InboxPage />);

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toHaveTextContent('Task 1');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_2}`)).toHaveTextContent('Task 2');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_3}`)).toHaveTextContent('Task 3');
    });

    it('should show total counter when tasks exist', () => {
      const tasks = [createMockTask()];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<InboxPage />);

      expect(screen.getByTestId('total-counter')).toHaveTextContent('1');
    });

    it('should not show total counter when no tasks', () => {
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<InboxPage />);

      expect(screen.queryByTestId('total-counter')).not.toBeInTheDocument();
    });

    it('should pass taskDocs to useLoadMore hook', () => {
      const tasks = [createMockTask({ $id: MOCK_TASK_ID_1 }), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<InboxPage />);

      expect(mockUseLoadMore).toHaveBeenCalledWith(tasks);
    });
  });

  describe('add task functionality', () => {
    it('should show add task button when form is not open', () => {
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<InboxPage />);

      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should show task form when add task button is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<InboxPage />);

      const addButton = screen.getByTestId('add-task-button');
      await user.click(addButton);

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    it('should hide add task button when form is open', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<InboxPage />);

      const addButton = screen.getByTestId('add-task-button');
      await user.click(addButton);

      expect(screen.queryByTestId('add-task-button')).not.toBeInTheDocument();
    });

    it('should hide form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<InboxPage />);

      await user.click(screen.getByTestId('add-task-button'));
      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      await user.click(screen.getByTestId('cancel-button'));
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
    });

    it('should call handleCreateTask when form is submitted', async () => {
      const user = userEvent.setup();
      const mockHandleCreateTask = vi.fn();
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseTaskOperations.mockReturnValue({
        handleCreateTask: mockHandleCreateTask,
        handleUpdateTask: vi.fn(),
        handleDeleteTask: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [],
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<InboxPage />);

      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('submit-button'));

      expect(mockHandleCreateTask).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should show empty state when no tasks and form is not open', () => {
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<InboxPage />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toHaveAttribute('data-variant', 'inbox');
    });

    it('should not show empty state when tasks exist', () => {
      const tasks = [createMockTask()];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<InboxPage />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should not show empty state when form is open', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<InboxPage />);

      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('load more functionality', () => {
    it('should show load more button when hasMore is true', () => {
      const tasks = [createMockTask()];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseTaskOperations.mockReturnValue({
        handleCreateTask: vi.fn(),
        handleUpdateTask: vi.fn(),
        handleDeleteTask: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: tasks,
        isLoading: false,
        hasMore: true,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<InboxPage />);

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      const tasks = [createMockTask()];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(tasks);

      render(<InboxPage />);

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when button is clicked', async () => {
      const user = userEvent.setup();
      const tasks = [createMockTask()];
      const mockHandleLoadMore = vi.fn();
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseTaskOperations.mockReturnValue({
        handleCreateTask: vi.fn(),
        handleUpdateTask: vi.fn(),
        handleDeleteTask: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: tasks,
        isLoading: false,
        hasMore: true,
        handleLoadMore: mockHandleLoadMore,
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<InboxPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      expect(mockHandleLoadMore).toHaveBeenCalled();
    });

    it('should disable load more button when loading', () => {
      const tasks = [createMockTask()];
      const mockData = createMockLoaderData(tasks);
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseTaskOperations.mockReturnValue({
        handleCreateTask: vi.fn(),
        handleUpdateTask: vi.fn(),
        handleDeleteTask: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: tasks,
        isLoading: true,
        hasMore: true,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<InboxPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
      expect(loadMoreButton).toHaveTextContent('Loading...');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<InboxPage />);

      expect(screen.getByRole('list', { name: 'Inbox tasks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
    });
  });
});
