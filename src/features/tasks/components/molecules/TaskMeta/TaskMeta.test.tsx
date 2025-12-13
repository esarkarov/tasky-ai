import { createMockProject, createMockTask } from '@/core/test-setup/factories';
import type { Project } from '@/features/projects/types';
import { TaskMeta } from '@/features/tasks/components/molecules/TaskMeta/TaskMeta';
import { Task } from '@/features/tasks/types';
import { ROUTES } from '@/shared/constants';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  ProjectBadge: ({ project }: { project: Project | null }) =>
    project?.$id ? (
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
  interface RenderOptions {
    task?: Task;
    project?: Project;
    route?: string;
  }

  const renderComponent = ({
    task = createMockTask(),
    project = createMockProject(),
    route = '/',
  }: RenderOptions = {}) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <TaskMeta
          task={task}
          project={project}
        />
      </MemoryRouter>
    );
  };

  const getDueDate = () => screen.queryByTestId('task-due-date');
  const getProjectBadge = () => screen.queryByTestId('project-badge');
  const getFooter = () => screen.queryByTestId('card-footer');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility logic', () => {
    it('should return null when neither due date nor project should be shown', () => {
      const { container } = renderComponent({
        task: createMockTask({ due_date: null }),
        route: ROUTES.INBOX,
      });

      expect(container.firstChild).toBeNull();
    });

    it('should render footer when task has due date and not on Today page', () => {
      renderComponent({
        task: createMockTask({ due_date: new Date('2025-12-31') }),
        route: ROUTES.INBOX,
      });

      expect(getFooter()).toBeInTheDocument();
      expect(getFooter()).toHaveClass('flex', 'gap-4', 'p-0');
      expect(getFooter()).toHaveAttribute('role', 'contentinfo');
    });

    it('should render footer when on non-inbox, non-project page with project', () => {
      renderComponent({
        task: createMockTask({
          due_date: null,
          project: createMockProject({ $id: 'task-project-1' }),
        }),
        route: ROUTES.TODAY,
      });

      expect(getFooter()).toBeInTheDocument();
    });
  });

  describe('due date display', () => {
    it('should show TaskDueDate with correct props when task has due date and not on Today page', () => {
      const dueDate = new Date('2025-12-31');
      renderComponent({
        task: createMockTask({ due_date: dueDate, completed: true }),
        route: ROUTES.INBOX,
      });

      const dueDateComponent = getDueDate();
      expect(dueDateComponent).toBeInTheDocument();
      expect(dueDateComponent).toHaveAttribute('data-completed', 'true');
      expect(dueDateComponent).toHaveAttribute('data-due-date', dueDate.toISOString());
    });

    it('should not show TaskDueDate on Today page or when task has no due date', () => {
      renderComponent({
        task: createMockTask({
          due_date: new Date('2025-12-31'),
          project: createMockProject({ $id: 'task-project-1' }),
        }),
        route: ROUTES.TODAY,
      });
      expect(getDueDate()).not.toBeInTheDocument();

      renderComponent({
        task: createMockTask({
          due_date: null,
          project: createMockProject({ $id: 'task-project-1' }),
        }),
        route: '/some-route',
      });
      expect(getDueDate()).not.toBeInTheDocument();
    });
  });

  describe('project badge display', () => {
    it('should show ProjectBadge when not on Inbox page and project differs', () => {
      renderComponent({
        task: createMockTask({ project: createMockProject({ $id: 'task-project-1' }) }),
        route: ROUTES.TODAY,
      });

      const badge = getProjectBadge();
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-project-id', 'task-project-1');
    });

    it('should not show ProjectBadge on Inbox page or when on same project page', () => {
      renderComponent({
        task: createMockTask({ project: createMockProject({ $id: 'task-project-1' }) }),
        route: ROUTES.INBOX,
      });
      expect(getProjectBadge()).not.toBeInTheDocument();

      const taskProject = createMockProject({ $id: 'project-123' });
      renderComponent({
        task: createMockTask({ project: taskProject }),
        project: taskProject,
        route: ROUTES.PROJECT('project-123'),
      });
      expect(getProjectBadge()).not.toBeInTheDocument();
    });

    it('should show ProjectBadge when task project differs from current page project', () => {
      renderComponent({
        task: createMockTask({
          project: createMockProject({ $id: 'project-123' }),
          due_date: new Date('2025-12-31'),
        }),
        project: createMockProject({ $id: 'project-456' }),
        route: ROUTES.PROJECT('project-456'),
      });

      const badge = getProjectBadge();
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-project-id', 'project-123');
    });
  });

  describe('combined scenarios', () => {
    it('should show both due date and project badge when applicable', () => {
      renderComponent({
        task: createMockTask({
          due_date: new Date('2025-12-31'),
          project: createMockProject({ $id: 'task-project-1' }),
        }),
        project: createMockProject({ $id: 'different-project' }),
        route: '/some-route',
      });

      expect(getDueDate()).toBeInTheDocument();
      expect(getProjectBadge()).toBeInTheDocument();
    });

    it('should show only due date when project should not be shown', () => {
      renderComponent({
        task: createMockTask({
          due_date: new Date('2025-12-31'),
          project: createMockProject({ $id: 'task-project-1' }),
        }),
        route: ROUTES.INBOX,
      });

      expect(getDueDate()).toBeInTheDocument();
      expect(getProjectBadge()).not.toBeInTheDocument();
    });

    it('should show only project badge when due date should not be shown', () => {
      renderComponent({
        task: createMockTask({
          due_date: new Date(),
          project: createMockProject({ $id: 'task-project-1' }),
        }),
        route: ROUTES.TODAY,
      });

      expect(getDueDate()).not.toBeInTheDocument();
      expect(getProjectBadge()).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle task with null project', () => {
      renderComponent({
        task: createMockTask({ due_date: new Date('2025-12-31'), project: null }),
        route: '/some-route',
      });

      expect(getDueDate()).toBeInTheDocument();
      expect(getProjectBadge()).not.toBeInTheDocument();
    });
  });
});
