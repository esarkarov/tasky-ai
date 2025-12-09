import { createMockProject, createMockTask } from '@/core/test-setup/factories';
import { Project } from '@/features/projects/types';
import { Task } from '@/features/tasks/types';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage/ProjectDetailPage';
import { ProjectDetailLoaderData } from '@/shared/types';
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
vi.mock('@/features/tasks/hooks/use-task-mutation/use-task-mutation', () => ({
  useTaskMutation: () => mockUseTaskMutation(),
}));

const mockUseLoadMore = vi.fn();
vi.mock('@/shared/hooks/use-load-more/use-load-more', () => ({
  useLoadMore: (tasks: Task[]) => mockUseLoadMore(tasks),
}));

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('ProjectDetailPage', () => {
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

  const renderWithProject = (project: Project, mockSetup: MockSetup = {}) => {
    const mockData: ProjectDetailLoaderData = { project };
    mockedUseLoaderData.mockReturnValue(mockData);
    const mocks = setupMocks(mockSetup);
    render(<ProjectDetailPage />);
    return mocks;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title and list structure with project name', () => {
      const project = createMockProject({ name: 'My Project', tasks: [] });

      renderWithProject(project, { tasks: [] });

      expect(screen.getByRole('heading', { name: 'My Project' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Tasks for project My Project' })).toBeInTheDocument();
    });

    it('should set document title with project name', () => {
      const project = createMockProject({ name: 'My Project', tasks: [] });

      renderWithProject(project, { tasks: [] });

      expect(document.title).toBe('Tasky AI | My Project');
    });

    it('should render top app bar with project name and task count', () => {
      const tasks = [createMockTask({ $id: MOCK_TASK_ID_1 }), createMockTask({ $id: MOCK_TASK_ID_2 })];
      const project = createMockProject({ name: 'My Project', tasks });

      renderWithProject(project, { tasks });

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('My Project');
      expect(screen.getByTestId('top-app-bar-count')).toHaveTextContent('2');
    });

    it('should render project action menu with correct aria-label', () => {
      const project = createMockProject({ name: 'My Project', tasks: [] });

      renderWithProject(project, { tasks: [] });

      expect(screen.getByRole('button', { name: 'More actions for project My Project' })).toBeInTheDocument();
    });

    it('should render add task button with correct aria-label', () => {
      const project = createMockProject({ name: 'My Project', tasks: [] });

      renderWithProject(project, { tasks: [] });

      expect(screen.getByRole('button', { name: 'Add new task to this project' })).toBeInTheDocument();
    });
  });

  describe('task display', () => {
    it('should render all incomplete tasks with correct content', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1', completed: false }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2', completed: false }),
      ];
      const project = createMockProject({ tasks });

      renderWithProject(project, { tasks });

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toHaveTextContent('Task 1');
      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_2}`)).toHaveTextContent('Task 2');
    });

    it('should filter out completed tasks from display', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, content: 'Task 1', completed: false }),
        createMockTask({ $id: MOCK_TASK_ID_2, content: 'Task 2', completed: true }),
      ];
      const project = createMockProject({ tasks });

      renderWithProject(project, { tasks: [tasks[0]] });

      expect(screen.getByTestId(`task-card-${MOCK_TASK_ID_1}`)).toBeInTheDocument();
      expect(screen.queryByTestId(`task-card-${MOCK_TASK_ID_2}`)).not.toBeInTheDocument();
    });

    it('should sort tasks by due date with null dates last', () => {
      const tasks = [
        createMockTask({ $id: MOCK_TASK_ID_1, due_date: new Date('2024-12-31') }),
        createMockTask({ $id: MOCK_TASK_ID_2, due_date: new Date('2024-12-01') }),
        createMockTask({ $id: MOCK_TASK_ID_3, due_date: null }),
      ];
      const sortedTasks = [tasks[1], tasks[0], tasks[2]];
      const project = createMockProject({ tasks });

      renderWithProject(project, { tasks: sortedTasks });

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

      renderWithProject(project, { tasks });

      expect(screen.getByTestId('total-counter')).toHaveTextContent('1');
    });

    it('should not show total counter when no tasks exist', () => {
      const project = createMockProject({ tasks: [] });

      renderWithProject(project, { tasks: [] });

      expect(screen.queryByTestId('total-counter')).not.toBeInTheDocument();
    });
  });

  describe('add task', () => {
    it('should show add task button initially', () => {
      const project = createMockProject({ tasks: [] });

      renderWithProject(project, { tasks: [] });

      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should show task form when add task button is clicked', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ tasks: [] });
      renderWithProject(project, { tasks: [] });

      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.queryByTestId('add-task-button')).not.toBeInTheDocument();
    });

    it('should hide form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ tasks: [] });
      renderWithProject(project, { tasks: [] });

      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('cancel-button'));

      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('should call handleCreate when form is submitted', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ tasks: [] });
      const { mockHandleCreate } = renderWithProject(project, { tasks: [] });

      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('submit-button'));

      expect(mockHandleCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    it('should show empty state with project variant when no tasks and form closed', () => {
      const project = createMockProject({ tasks: [] });

      renderWithProject(project, { tasks: [] });

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveAttribute('data-variant', 'project');
    });

    it('should not show empty state when tasks exist', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });

      renderWithProject(project, { tasks });

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should not show empty state when form is open', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ tasks: [] });
      renderWithProject(project, { tasks: [] });

      await user.click(screen.getByTestId('add-task-button'));

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('load more', () => {
    it('should show load more button when hasMore is true', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });

      renderWithProject(project, { tasks, hasMore: true });

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });

      renderWithProject(project, { tasks });

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when load more button is clicked', async () => {
      const user = userEvent.setup();
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });
      const { mockHandleLoadMore } = renderWithProject(project, { tasks, hasMore: true });

      await user.click(screen.getByTestId('load-more-button'));

      expect(mockHandleLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should disable load more button and show loading text when loading', () => {
      const tasks = [createMockTask()];
      const project = createMockProject({ tasks });

      renderWithProject(project, { tasks, hasMore: true, isLoading: true });

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
      expect(loadMoreButton).toHaveTextContent('Loading...');
    });
  });
});
