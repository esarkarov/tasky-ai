import { createMockProject, createMockProjects, createMockTask, createMockTasks } from '@/core/test-setup/factories';
import { projectService } from '@/features/projects/services/project.service';
import { tasksCompletedLoader } from '@/features/tasks/router/loaders/tasks-completed/tasks-completed.loader';
import { taskService } from '@/features/tasks/services/task.service';
import type { ProjectsWithTasksLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tasks/services/task.service', () => ({
  taskService: {
    findCompletedTasks: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    findRecent: vi.fn(),
  },
}));

const mockTaskService = vi.mocked(taskService);
const mockProjectService = vi.mocked(projectService);

describe('tasksCompletedLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful data loading', () => {
    it('should return completed tasks and recent projects', async () => {
      const mockTasks = createMockTasks([
        createMockTask({ $id: 'task-1', content: 'Completed task 1', completed: true }),
        createMockTask({ $id: 'task-2', content: 'Completed task 2', completed: true }),
      ]);
      const mockProjects = createMockProjects();
      mockTaskService.findCompletedTasks.mockResolvedValue(mockTasks);
      mockProjectService.findRecent.mockResolvedValue(mockProjects);

      const result = (await tasksCompletedLoader()) as ProjectsWithTasksLoaderData;

      expect(result).toEqual({
        tasks: mockTasks,
        projects: mockProjects,
      });
      expect(mockTaskService.findCompletedTasks).toHaveBeenCalledOnce();
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
    });

    it('should return empty collections when no completed tasks exist', async () => {
      const emptyTasks = createMockTasks([]);
      const mockProjects = createMockProjects();
      mockTaskService.findCompletedTasks.mockResolvedValue(emptyTasks);
      mockProjectService.findRecent.mockResolvedValue(mockProjects);

      const result = (await tasksCompletedLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.tasks.documents).toHaveLength(0);
    });

    it('should maintain task-project relationships', async () => {
      const project = createMockProject({ $id: 'project-1' });
      const taskWithProject = createMockTask({ projectId: project, completed: true });
      const tasks = createMockTasks([taskWithProject]);
      const projects = createMockProjects();
      mockTaskService.findCompletedTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksCompletedLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.documents[0].projectId?.$id).toBe('project-1');
    });

    it('should preserve task due dates', async () => {
      const dueDate = new Date('2023-12-31');
      const taskWithDueDate = createMockTask({ due_date: dueDate, completed: true });
      const tasks = createMockTasks([taskWithDueDate]);
      const projects = createMockProjects();
      mockTaskService.findCompletedTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksCompletedLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.documents[0].due_date).toEqual(dueDate);
    });

    it('should ensure all returned tasks are marked as completed', async () => {
      const mockTasks = createMockTasks([createMockTask({ completed: true }), createMockTask({ completed: true })]);
      const projects = createMockProjects();
      mockTaskService.findCompletedTasks.mockResolvedValue(mockTasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksCompletedLoader()) as ProjectsWithTasksLoaderData;

      const allTasksCompleted = result.tasks.documents.every((task) => task.completed);
      expect(allTasksCompleted).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error when task service fails', async () => {
      mockTaskService.findCompletedTasks.mockRejectedValue(new Error('Task service failed'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(tasksCompletedLoader()).rejects.toThrow('Task service failed');
    });

    it('should throw error when project service fails', async () => {
      mockTaskService.findCompletedTasks.mockResolvedValue(createMockTasks());
      mockProjectService.findRecent.mockRejectedValue(new Error('Project service failed'));

      await expect(tasksCompletedLoader()).rejects.toThrow('Project service failed');
    });
  });
});
