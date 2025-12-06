import { createMockProject, createMockProjects, createMockTask, createMockTasks } from '@/core/test-setup/factories';
import { projectService } from '@/features/projects/services/project.service';
import { tasksUpcomingLoader } from '@/features/tasks/router/loaders/tasks-upcoming/tasks-upcoming.loader';
import { taskService } from '@/features/tasks/services/task.service';
import type { ProjectsWithTasksLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tasks/services/task.service', () => ({
  taskService: {
    findUpcomingTasks: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    findRecent: vi.fn(),
  },
}));

const mockTaskService = vi.mocked(taskService);
const mockProjectService = vi.mocked(projectService);

describe('tasksUpcomingLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful data loading', () => {
    it('should return upcoming tasks and recent projects', async () => {
      const mockTasks = createMockTasks();
      const mockProjects = createMockProjects();
      mockTaskService.findUpcomingTasks.mockResolvedValue(mockTasks);
      mockProjectService.findRecent.mockResolvedValue(mockProjects);

      const result = (await tasksUpcomingLoader()) as ProjectsWithTasksLoaderData;

      expect(result).toEqual({
        tasks: mockTasks,
        projects: mockProjects,
      });
      expect(mockTaskService.findUpcomingTasks).toHaveBeenCalledOnce();
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
    });

    it('should return empty collections when no data exists', async () => {
      const emptyTasks = createMockTasks([]);
      const emptyProjects = createMockProjects([]);
      mockTaskService.findUpcomingTasks.mockResolvedValue(emptyTasks);
      mockProjectService.findRecent.mockResolvedValue(emptyProjects);

      const result = (await tasksUpcomingLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.tasks.documents).toHaveLength(0);
      expect(result.projects.total).toBe(0);
      expect(result.projects.documents).toHaveLength(0);
    });

    it('should preserve task due dates', async () => {
      const futureDate = new Date('2025-12-25');
      const taskWithDueDate = createMockTask({ due_date: futureDate });
      const tasks = createMockTasks([taskWithDueDate]);
      const projects = createMockProjects();
      mockTaskService.findUpcomingTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksUpcomingLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.documents[0].due_date).toEqual(futureDate);
    });

    it('should maintain task-project relationships', async () => {
      const project = createMockProject();
      const taskWithProject = createMockTask({ projectId: project });
      const tasks = createMockTasks([taskWithProject]);
      const projects = createMockProjects([project]);
      mockTaskService.findUpcomingTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksUpcomingLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.documents[0].projectId?.$id).toBe(project.$id);
    });
  });

  describe('error handling', () => {
    it('should throw error when task service fails', async () => {
      mockTaskService.findUpcomingTasks.mockRejectedValue(new Error('Task service failed'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(tasksUpcomingLoader()).rejects.toThrow('Task service failed');
    });

    it('should throw error when project service fails', async () => {
      mockTaskService.findUpcomingTasks.mockResolvedValue(createMockTasks());
      mockProjectService.findRecent.mockRejectedValue(new Error('Project service failed'));

      await expect(tasksUpcomingLoader()).rejects.toThrow('Project service failed');
    });
  });
});
