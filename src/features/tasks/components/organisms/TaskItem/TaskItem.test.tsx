import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskItem } from './TaskItem';
import { Task } from '@/features/tasks/types';
import { Project } from '@/features/projects/types';

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
    <div data-testid="task-meta">
      <span>Due: {task.due_date?.toISOString() || 'No date'}</span>
      <span>Project: {project.name}</span>
    </div>
  ),
}));

describe('TaskItem', () => {
  const mockHandleEdit = vi.fn();
  const createMockTask = (overrides?: Partial<Task>): Task => ({
    $id: 'task-1',
    id: 'task-1',
    content: 'Test task content',
    completed: false,
    due_date: null,
    project: null,
    projectId: null,
    $createdAt: '2024-01-01',
    $updatedAt: '2024-01-01',
    $collectionId: 'tasks',
    $databaseId: 'db',
    $permissions: [],
    ...overrides,
  });
  const createMockProject = (overrides?: Partial<Project>): Project => ({
    $id: 'project-1',
    name: 'Test Project',
    color_name: 'blue',
    color_hex: '#0000FF',
    tasks: [],
    userId: 'user-1',
    $createdAt: '2024-01-01',
    $updatedAt: '2024-01-01',
    $collectionId: 'projects',
    $databaseId: 'db',
    $permissions: [],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render task content', () => {
      const task = createMockTask({ content: 'Buy groceries' });
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('should render CompleteTaskButton with correct props', () => {
      const task = createMockTask({ id: 'task-123', completed: false });
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      const button = screen.getByTestId('complete-button');
      expect(button).toHaveAttribute('data-task-id', 'task-123');
      expect(button).toHaveAttribute('data-completed', 'false');
    });

    it('should render TaskActions component', () => {
      const task = createMockTask();
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      expect(screen.getByTestId('task-actions')).toBeInTheDocument();
    });

    it('should render TaskMeta component', () => {
      const task = createMockTask();
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      expect(screen.getByTestId('task-meta')).toBeInTheDocument();
    });
  });

  describe('Task Completion State', () => {
    it('should apply strikethrough style to completed task', () => {
      const task = createMockTask({ content: 'Completed task', completed: true });
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      const taskContent = screen.getByText('Completed task');
      expect(taskContent).toHaveClass('line-through');
      expect(taskContent).toHaveClass('text-muted-foreground');
    });

    it('should not apply strikethrough style to incomplete task', () => {
      const task = createMockTask({ content: 'Active task', completed: false });
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      const taskContent = screen.getByText('Active task');
      expect(taskContent).not.toHaveClass('line-through');
      expect(taskContent).not.toHaveClass('text-muted-foreground');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const task = createMockTask({ id: 'task-456' });
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-labelledby', 'task-task-456-content');
      expect(container).toHaveAttribute('aria-describedby', 'task-task-456-metadata');
    });

    it('should have unique id for task content', () => {
      const task = createMockTask({ id: 'task-789', content: 'Unique task' });
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      const taskContent = screen.getByText('Unique task');
      expect(taskContent).toHaveAttribute('id', 'task-task-789-content');
    });
  });

  describe('Layout Structure', () => {
    it('should have correct grid layout classes', () => {
      const task = createMockTask();
      const project = createMockProject();

      const { container } = render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass(
        'group/card',
        'relative',
        'grid',
        'grid-cols-[max-content,minmax(0,1fr)]',
        'gap-3',
        'border-b'
      );
    });
  });

  describe('Component Integration', () => {
    it('should pass task and project to TaskMeta', () => {
      const task = createMockTask({ due_date: new Date('2024-12-25') });
      const project = createMockProject({ name: 'Work Project' });

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      expect(screen.getByText(/Work Project/)).toBeInTheDocument();
    });

    it('should pass handleEdit to TaskActions', () => {
      const task = createMockTask();
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      const editButton = screen.getByText('Edit');
      editButton.click();

      expect(mockHandleEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty task content', () => {
      const task = createMockTask({ content: '' });
      const project = createMockProject();

      const { container } = render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      const taskContent = container.querySelector('#task-task-1-content') as HTMLElement;
      expect(taskContent).toHaveTextContent('');
      expect(taskContent).toBeInTheDocument();
    });

    it('should handle long task content', () => {
      const longContent = 'A'.repeat(200);
      const task = createMockTask({ content: longContent });
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle task with special characters', () => {
      const task = createMockTask({ content: 'Task with émojis 🎉 & symbols: <>&"' });
      const project = createMockProject();

      render(
        <TaskItem
          task={task}
          project={project}
          handleEdit={mockHandleEdit}
        />
      );

      expect(screen.getByText(/Task with émojis/)).toBeInTheDocument();
    });
  });
});
