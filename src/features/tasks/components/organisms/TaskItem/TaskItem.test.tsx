import { createMockProject, createMockTask } from '@/core/test-setup/factories';
import type { Project } from '@/features/projects/types';
import type { Task } from '@/features/tasks/types';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskItem } from './TaskItem';

vi.mock('@/features/tasks/components/atoms/CompleteTaskButton/CompleteTaskButton', () => ({
  CompleteTaskButton: ({ taskId, completed }: { taskId: string; completed: boolean }) => (
    <button
      data-testid="complete-button"
      data-task-id={taskId}
      data-completed={completed}>
      Complete
    </button>
  ),
}));

vi.mock('@/features/tasks/components/molecules/TaskActions/TaskActions', () => ({
  TaskActions: ({ task, handleEdit }: { task: Task; handleEdit: () => void }) => (
    <div data-testid="task-actions">
      {!task.completed && <button onClick={handleEdit}>Edit</button>}
      <button>Delete</button>
    </div>
  ),
}));

vi.mock('@/features/tasks/components/molecules/TaskMeta/TaskMeta', () => ({
  TaskMeta: ({ task, project }: { task: Task; project: Project }) => (
    <div
      data-testid="task-meta"
      id={`task-${task.id}-metadata`}>
      <span>Due: {task.due_date?.toISOString() || 'No date'}</span>
      <span>Project: {project.name}</span>
    </div>
  ),
}));

vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, className }: React.ComponentProps<'div'>) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: React.ComponentProps<'div'>) => <div className={className}>{children}</div>,
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('TaskItem', () => {
  const mockHandleEdit = vi.fn();

  interface RenderOptions {
    taskOverrides?: Partial<Parameters<typeof createMockTask>[0]>;
    projectOverrides?: Partial<Parameters<typeof createMockProject>[0]>;
  }

  const renderComponent = ({ taskOverrides = {}, projectOverrides = {} }: RenderOptions = {}) => {
    const task = createMockTask(taskOverrides);
    const project = createMockProject(projectOverrides);

    return render(
      <TaskItem
        task={task}
        project={project}
        handleEdit={mockHandleEdit}
      />
    );
  };

  const getContainer = () => screen.getByRole('group');
  const getTaskContent = (content: string) => screen.getByText(content);
  const getCompleteButton = () => screen.getByTestId('complete-button');
  const getTaskActions = () => screen.getByTestId('task-actions');
  const getTaskMeta = () => screen.getByTestId('task-meta');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render task with all components and correct structure', () => {
      const { container } = renderComponent({ taskOverrides: { content: 'Buy groceries', id: 'task-123' } });

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass(
        'group/card',
        'relative',
        'grid',
        'grid-cols-[max-content,minmax(0,1fr)]',
        'gap-3',
        'border-b'
      );

      expect(getTaskContent('Buy groceries')).toBeInTheDocument();
      expect(getCompleteButton()).toHaveAttribute('data-task-id', 'task-123');
      expect(getTaskActions()).toBeInTheDocument();
      expect(getTaskMeta()).toBeInTheDocument();
    });

    it('should render with correct ARIA attributes and unique IDs', () => {
      renderComponent({ taskOverrides: { id: 'task-456', content: 'Unique task' } });

      const container = getContainer();
      expect(container).toHaveAttribute('aria-labelledby', 'task-task-456-content');
      expect(container).toHaveAttribute('aria-describedby', 'task-task-456-metadata');

      const taskContent = getTaskContent('Unique task');
      expect(taskContent).toHaveAttribute('id', 'task-task-456-content');
    });
  });

  describe('completion state', () => {
    it('should apply strikethrough styles when task is completed', () => {
      renderComponent({ taskOverrides: { content: 'Completed task', completed: true } });

      const taskContent = getTaskContent('Completed task');
      expect(taskContent).toHaveClass('line-through', 'text-muted-foreground');
      expect(getCompleteButton()).toHaveAttribute('data-completed', 'true');
    });

    it('should not apply strikethrough styles when task is incomplete', () => {
      renderComponent({ taskOverrides: { content: 'Active task', completed: false } });

      const taskContent = getTaskContent('Active task');
      expect(taskContent).not.toHaveClass('line-through');
      expect(taskContent).not.toHaveClass('text-muted-foreground');
      expect(getCompleteButton()).toHaveAttribute('data-completed', 'false');
    });
  });

  describe('component integration', () => {
    it('should pass task and project data to child components', () => {
      renderComponent({
        taskOverrides: { due_date: new Date('2024-12-25') },
        projectOverrides: { name: 'Work Project' },
      });

      expect(screen.getByText(/Work Project/)).toBeInTheDocument();
    });

    it('should call handleEdit when edit button is clicked', () => {
      renderComponent();

      screen.getByText('Edit').click();

      expect(mockHandleEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty task content', () => {
      const { container } = renderComponent({ taskOverrides: { content: '' } });

      const taskContent = container.querySelector('#task-task-1-content') as HTMLElement;
      expect(taskContent).toHaveTextContent('');
      expect(taskContent).toBeInTheDocument();
    });

    it('should handle long and special character content', () => {
      const longContent = 'A'.repeat(200);
      renderComponent({ taskOverrides: { content: longContent } });
      expect(getTaskContent(longContent)).toBeInTheDocument();

      renderComponent({ taskOverrides: { content: 'Task with émojis 🎉 & symbols: <>&"' } });
      expect(screen.getByText(/Task with émojis/)).toBeInTheDocument();
    });
  });
});
