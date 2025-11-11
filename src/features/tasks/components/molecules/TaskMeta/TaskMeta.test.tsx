import { ProjectEntity } from '@/features/projects/types';
import { TaskEntity } from '@/features/tasks/types';
import { ROUTES } from '@/shared/constants/routes';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskMeta } from './TaskMeta';

vi.mock('@/features/tasks/components/atoms/TaskDueDate/TaskDueDate', () => ({
  TaskDueDate: ({ completed, dueDate }: { completed: boolean; dueDate: Date | null }) => (
    <div
      data-testid="task-due-date"
      data-completed={completed}
      data-due-date={dueDate?.toISOString()}>
      Due Date
    </div>
  ),
}));

vi.mock('@/features/projects/components/atoms/ProjectBadge/ProjectBadge', () => ({
  ProjectBadge: ({ project }: { project: ProjectEntity | null }) =>
    project && project.$id ? (
      <div
        data-testid="project-badge"
        data-project-id={project.$id}>
        Project Badge
      </div>
    ) : null,
}));

vi.mock('@/shared/components/ui/card', () => ({
  CardFooter: ({ children, className, role }: { children: React.ReactNode; className: string; role: string }) => (
    <footer
      className={className}
      role={role}
      data-testid="card-footer">
      {children}
    </footer>
  ),
}));

describe('TaskMeta', () => {
  const MOCK_PROJECT_ID = 'project-1';
  const MOCK_TASK_ID_1 = 'task-1';

  const createMockTask = (overrides?: Partial<TaskEntity>): TaskEntity => ({
    id: MOCK_TASK_ID_1,
    $id: MOCK_TASK_ID_1,
    content: 'Test task',
    completed: false,
    due_date: new Date('2024-12-31'),
    projectId: null,
    project: null,
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

  const renderComponent = (ui: React.ReactElement, route = '/') => {
    return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility logic', () => {
    it('should return null when neither due date nor project should be shown', () => {
      const task = createMockTask({ due_date: null });
      const project = createMockProject();

      const { container } = renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.INBOX
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when task has due date and not on Today page', () => {
      const dueDate = new Date('2025-12-31');
      const task = createMockTask({ due_date: dueDate });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.INBOX
      );

      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render when on non-inbox and non-project page with project', () => {
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ due_date: null, project: taskProject });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.TODAY
      );

      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('due date display', () => {
    it('should show TaskDueDate when task has due date and not on Today page', () => {
      const dueDate = new Date('2025-12-31');
      const task = createMockTask({ due_date: dueDate });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.INBOX
      );

      const dueDateComponent = screen.getByTestId('task-due-date');
      expect(dueDateComponent).toBeInTheDocument();
      expect(dueDateComponent).toHaveAttribute('data-completed', 'false');
      expect(dueDateComponent).toHaveAttribute('data-due-date', dueDate.toISOString());
    });

    it('should not show TaskDueDate on Today page even with due date', () => {
      const dueDate = new Date('2025-12-31');
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ due_date: dueDate, project: taskProject });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.TODAY
      );

      const dueDateComponent = screen.queryByTestId('task-due-date');
      expect(dueDateComponent).not.toBeInTheDocument();
    });

    it('should not show TaskDueDate when task has no due date', () => {
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ due_date: null, project: taskProject });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        '/some-route'
      );

      const dueDateComponent = screen.queryByTestId('task-due-date');
      expect(dueDateComponent).not.toBeInTheDocument();
    });

    it('should pass completed status to TaskDueDate', () => {
      const dueDate = new Date('2025-12-31');
      const task = createMockTask({ due_date: dueDate, completed: true });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        '/some-route'
      );

      const dueDateComponent = screen.getByTestId('task-due-date');
      expect(dueDateComponent).toHaveAttribute('data-completed', 'true');
    });
  });

  describe('project badge display', () => {
    it('should show ProjectBadge when not on Inbox page', () => {
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ project: taskProject });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.TODAY
      );

      const projectBadge = screen.getByTestId('project-badge');
      expect(projectBadge).toBeInTheDocument();
      expect(projectBadge).toHaveAttribute('data-project-id', 'task-project-1');
    });

    it('should not show ProjectBadge on Inbox page', () => {
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ project: taskProject });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.INBOX
      );

      const projectBadge = screen.queryByTestId('project-badge');
      expect(projectBadge).not.toBeInTheDocument();
    });

    it('should not show ProjectBadge when on the project page itself', () => {
      const taskProject = createMockProject({ $id: 'project-123' });
      const task = createMockTask({ project: taskProject });

      renderComponent(
        <TaskMeta
          task={task}
          project={taskProject}
        />,
        ROUTES.PROJECT('project-123')
      );

      const projectBadge = screen.queryByTestId('project-badge');
      expect(projectBadge).not.toBeInTheDocument();
    });

    it('should show ProjectBadge when task project differs from current page project', () => {
      const taskProject = createMockProject({ $id: 'project-123' });
      const currentProject = createMockProject({ $id: 'project-456' });
      const task = createMockTask({ project: taskProject, due_date: new Date('2025-12-31') });

      renderComponent(
        <TaskMeta
          task={task}
          project={currentProject}
        />,
        ROUTES.PROJECT(currentProject.$id)
      );

      expect(screen.getByTestId('project-badge')).toBeInTheDocument();
      expect(screen.getByTestId('project-badge')).toHaveAttribute('data-project-id', 'project-123');
    });
  });

  describe('CardFooter rendering', () => {
    it('should render CardFooter with correct props when visible', () => {
      const dueDate = new Date('2025-12-31');
      const task = createMockTask({ due_date: dueDate });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        '/some-route'
      );

      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
      expect(footer).toHaveClass('flex', 'gap-4', 'p-0');
    });
  });

  describe('combined scenarios', () => {
    it('should show both due date and project badge when applicable', () => {
      const dueDate = new Date('2025-12-31');
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ due_date: dueDate, project: taskProject });
      const currentProject = createMockProject({ $id: 'different-project' });

      renderComponent(
        <TaskMeta
          task={task}
          project={currentProject}
        />,
        '/some-route'
      );

      expect(screen.getByTestId('task-due-date')).toBeInTheDocument();
      expect(screen.getByTestId('project-badge')).toBeInTheDocument();
    });

    it('should show only due date when project should not be shown', () => {
      const dueDate = new Date('2025-12-31');
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ due_date: dueDate, project: taskProject });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.INBOX
      );

      expect(screen.getByTestId('task-due-date')).toBeInTheDocument();
      expect(screen.queryByTestId('project-badge')).not.toBeInTheDocument();
    });

    it('should show only project badge when due date should not be shown', () => {
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ due_date: new Date(), project: taskProject });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        ROUTES.TODAY
      );

      expect(screen.queryByTestId('task-due-date')).not.toBeInTheDocument();
      expect(screen.getByTestId('project-badge')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle task with null project', () => {
      const dueDate = new Date('2025-12-31');
      const task = createMockTask({ due_date: dueDate, project: null });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        '/some-route'
      );

      expect(screen.getByTestId('task-due-date')).toBeInTheDocument();
      expect(screen.queryByTestId('project-badge')).not.toBeInTheDocument();
    });

    it('should handle different route paths correctly', () => {
      const dueDate = new Date('2025-12-31');
      const taskProject = createMockProject({ $id: 'task-project-1' });
      const task = createMockTask({ due_date: dueDate, project: taskProject });
      const project = createMockProject();

      renderComponent(
        <TaskMeta
          task={task}
          project={project}
        />,
        '/custom/route'
      );

      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
    });
  });
});
