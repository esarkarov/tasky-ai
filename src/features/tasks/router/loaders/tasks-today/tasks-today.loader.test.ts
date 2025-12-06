import { createMockProject, createMockProjects, createMockTask, createMockTasks } from '@/core/test-setup/factories';
import { projectService } from '@/features/projects/services/project.service';
import { tasksTodayLoader } from '@/features/tasks/router/loaders/tasks-today/tasks-today.loader';
import { taskService } from '@/features/tasks/services/task.service';
import type { ProjectsWithTasksLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tasks/services/task.service', () => ({
  taskService: {
    findTodayTasks: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    findRecent: vi.fn(),
  },
}));

const mockTaskService = vi.mocked(taskService);
const mockProjectService = vi.mocked(projectService);

describe('tasksTodayLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful data loading', () => {
    it('should return today tasks and recent projects', async () => {
      const mockTasks = createMockTasks([
        createMockTask({ $id: 'task-1', content: 'Today task 1' }),
        createMockTask({ $id: 'task-2', content: 'Today task 2', completed: true }),
      ]);
      const mockProjects = createMockProjects();
      mockTaskService.findTodayTasks.mockResolvedValue(mockTasks);
      mockProjectService.findRecent.mockResolvedValue(mockProjects);

      const result = (await tasksTodayLoader()) as ProjectsWithTasksLoaderData;

      expect(result).toEqual({
        tasks: mockTasks,
        projects: mockProjects,
      });
      expect(mockTaskService.findTodayTasks).toHaveBeenCalledOnce();
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
    });

    it('should return empty collections when no tasks exist', async () => {
      const emptyTasks = createMockTasks([]);
      const mockProjects = createMockProjects();
      mockTaskService.findTodayTasks.mockResolvedValue(emptyTasks);
      mockProjectService.findRecent.mockResolvedValue(mockProjects);

      const result = (await tasksTodayLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.tasks.documents).toHaveLength(0);
    });

    it('should preserve task due dates', async () => {
      const today = new Date();
      const taskWithDueDate = createMockTask({ content: 'Due today', due_date: today });
      const tasks = createMockTasks([taskWithDueDate]);
      const projects = createMockProjects();
      mockTaskService.findTodayTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksTodayLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.documents[0].due_date).toEqual(today);
    });

    it('should maintain task-project relationships', async () => {
      const project = createMockProject();
      const taskWithProject = createMockTask({ content: 'Project task', projectId: project });
      const tasks = createMockTasks([taskWithProject]);
      const projects = createMockProjects();
      mockTaskService.findTodayTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksTodayLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.documents[0].projectId?.$id).toBe(project.$id);
    });
  });

  describe('error handling', () => {
    it('should throw error when task service fails', async () => {
      mockTaskService.findTodayTasks.mockRejectedValue(new Error('Task service failed'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(tasksTodayLoader()).rejects.toThrow('Task service failed');
    });

    it('should throw error when project service fails', async () => {
      mockTaskService.findTodayTasks.mockResolvedValue(createMockTasks());
      mockProjectService.findRecent.mockRejectedValue(new Error('Project service failed'));

      await expect(tasksTodayLoader()).rejects.toThrow('Project service failed');
    });
  });
});
