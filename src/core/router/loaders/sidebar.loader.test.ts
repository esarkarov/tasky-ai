import { sidebarLoader } from '@/core/router/loaders/sidebar.loader';
import { createMockLoaderArgs, createMockProjects, createMockTaskCounts } from '@/core/test-setup/factories';
import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';
import type { SidebarLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    findRecent: vi.fn(),
  },
}));

vi.mock('@/features/tasks/services/task.service', () => ({
  taskService: {
    countTasks: vi.fn(),
  },
}));

const mockProjectService = vi.mocked(projectService);
const mockTaskService = vi.mocked(taskService);

describe('sidebarLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful data loading', () => {
    it('should return projects and task counts when both services succeed', async () => {
      const mockProjects = createMockProjects();
      const mockTaskCounts = createMockTaskCounts();
      mockProjectService.findRecent.mockResolvedValue(mockProjects);
      mockTaskService.countTasks.mockResolvedValue(mockTaskCounts);

      const result = (await sidebarLoader(createMockLoaderArgs())) as SidebarLoaderData;

      expect(result).toEqual({
        projects: mockProjects,
        taskCounts: mockTaskCounts,
      });
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(mockTaskService.countTasks).toHaveBeenCalledOnce();
    });

    it('should return empty data when no projects or tasks exist', async () => {
      const emptyProjects = createMockProjects([]);
      const zeroCounts = createMockTaskCounts(0, 0);
      mockProjectService.findRecent.mockResolvedValue(emptyProjects);
      mockTaskService.countTasks.mockResolvedValue(zeroCounts);

      const result = (await sidebarLoader(createMockLoaderArgs())) as SidebarLoaderData;

      expect(result.projects.total).toBe(0);
      expect(result.projects.documents).toHaveLength(0);
      expect(result.taskCounts.todayTasks).toBe(0);
      expect(result.taskCounts.inboxTasks).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should throw error when project service fails', async () => {
      mockProjectService.findRecent.mockRejectedValue(new Error('Project service error'));
      mockTaskService.countTasks.mockResolvedValue(createMockTaskCounts());

      await expect(sidebarLoader(createMockLoaderArgs())).rejects.toThrow('Project service error');
    });

    it('should throw error when task service fails', async () => {
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());
      mockTaskService.countTasks.mockRejectedValue(new Error('Task service error'));

      await expect(sidebarLoader(createMockLoaderArgs())).rejects.toThrow('Task service error');
    });

    it('should throw first error when both services fail', async () => {
      mockProjectService.findRecent.mockRejectedValue(new Error('Project error'));
      mockTaskService.countTasks.mockRejectedValue(new Error('Task error'));

      await expect(sidebarLoader(createMockLoaderArgs())).rejects.toThrow('Project error');
    });
  });

  describe('concurrent execution', () => {
    it('should call both services in parallel', async () => {
      const mockProjects = createMockProjects();
      const mockTaskCounts = createMockTaskCounts();
      let projectResolveTime = 0;
      let taskResolveTime = 0;

      mockProjectService.findRecent.mockImplementation(async () => {
        projectResolveTime = Date.now();
        return mockProjects;
      });

      mockTaskService.countTasks.mockImplementation(async () => {
        taskResolveTime = Date.now();
        return mockTaskCounts;
      });

      await sidebarLoader(createMockLoaderArgs());

      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(mockTaskService.countTasks).toHaveBeenCalledOnce();
      expect(Math.abs(projectResolveTime - taskResolveTime)).toBeLessThan(50);
    });

    it('should maintain independent state across multiple calls', async () => {
      const mockProjects = createMockProjects();
      const mockTaskCounts = createMockTaskCounts();
      mockProjectService.findRecent.mockResolvedValue(mockProjects);
      mockTaskService.countTasks.mockResolvedValue(mockTaskCounts);

      const firstCall = (await sidebarLoader(createMockLoaderArgs())) as SidebarLoaderData;
      const secondCall = (await sidebarLoader(createMockLoaderArgs())) as SidebarLoaderData;

      expect(firstCall).toEqual(secondCall);
      expect(mockProjectService.findRecent).toHaveBeenCalledTimes(2);
      expect(mockTaskService.countTasks).toHaveBeenCalledTimes(2);
    });
  });
});
