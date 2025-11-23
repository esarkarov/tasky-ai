import { sidebarLoader } from '@/core/router/loaders/sidebar.loader';
import { createMockLoaderArgs, createMockProjects, createMockTaskCounts } from '@/core/test-setup/factories';
import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';
import { SidebarLoaderData } from '@/shared/types';
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sidebarLoader', () => {
  describe('successful data fetching', () => {
    it('returns recent projects and task counts', async () => {
      const mockProjects = createMockProjects();
      const mockTaskCounts = createMockTaskCounts();
      mockProjectService.findRecent.mockResolvedValue(mockProjects);
      mockTaskService.countTasks.mockResolvedValue(mockTaskCounts);

      const result = await sidebarLoader(createMockLoaderArgs());

      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(mockTaskService.countTasks).toHaveBeenCalledOnce();
      expect(result).toEqual({ projects: mockProjects, taskCounts: mockTaskCounts });
    });

    it('returns empty projects and zero task counts', async () => {
      const emptyProjects = createMockProjects([]);
      const zeroCounts = createMockTaskCounts(0, 0);
      mockProjectService.findRecent.mockResolvedValue(emptyProjects);
      mockTaskService.countTasks.mockResolvedValue(zeroCounts);

      const result = await sidebarLoader(createMockLoaderArgs());

      expect(result).toEqual({ projects: emptyProjects, taskCounts: zeroCounts });
    });

    it('calls both services in parallel', async () => {
      const projects = createMockProjects();
      const taskCounts = createMockTaskCounts();
      const getRecentSpy = vi.spyOn(projectService, 'findRecent');
      const getCountsSpy = vi.spyOn(taskService, 'countTasks');

      mockProjectService.findRecent.mockResolvedValue(projects);
      mockTaskService.countTasks.mockResolvedValue(taskCounts);

      const result = await sidebarLoader(createMockLoaderArgs());

      expect(getRecentSpy).toHaveBeenCalledOnce();
      expect(getCountsSpy).toHaveBeenCalledOnce();
      expect(result).toEqual({ projects, taskCounts });
    });
  });

  describe('error handling', () => {
    it('throws if projectService fails', async () => {
      const error = new Error('Failed to fetch projects');
      mockProjectService.findRecent.mockRejectedValue(error);
      mockTaskService.countTasks.mockResolvedValue({ todayTasks: 0, inboxTasks: 0 });

      await expect(sidebarLoader(createMockLoaderArgs())).rejects.toThrow('Failed to fetch projects');

      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(mockTaskService.countTasks).toHaveBeenCalledOnce();
    });

    it('throws if taskService fails', async () => {
      const projects = createMockProjects();
      mockProjectService.findRecent.mockResolvedValue(projects);
      mockTaskService.countTasks.mockRejectedValue(new Error('Failed to fetch tasks'));

      await expect(sidebarLoader(createMockLoaderArgs())).rejects.toThrow('Failed to fetch tasks');
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(mockTaskService.countTasks).toHaveBeenCalledOnce();
    });

    it('throws the first error if both services fail', async () => {
      mockProjectService.findRecent.mockRejectedValue(new Error('Project error'));
      mockTaskService.countTasks.mockRejectedValue(new Error('Task error'));

      await expect(sidebarLoader(createMockLoaderArgs())).rejects.toThrow('Project error');
    });
  });

  describe('edge cases', () => {
    it('handles empty responses gracefully', async () => {
      mockProjectService.findRecent.mockResolvedValue({ total: 0, documents: [] });
      mockTaskService.countTasks.mockResolvedValue({ todayTasks: 0, inboxTasks: 0 });

      const result = (await sidebarLoader(createMockLoaderArgs())) as SidebarLoaderData;
      expect(result.projects.total).toBe(0);
      expect(result.taskCounts.todayTasks).toBe(0);
    });

    it('supports multiple consecutive calls without state leakage', async () => {
      const mockProjects = createMockProjects();
      const mockCounts = createMockTaskCounts();

      mockProjectService.findRecent.mockResolvedValue(mockProjects);
      mockTaskService.countTasks.mockResolvedValue(mockCounts);

      const first = await sidebarLoader(createMockLoaderArgs());
      const second = await sidebarLoader(createMockLoaderArgs());

      expect(first).toEqual(second);
      expect(mockProjectService.findRecent).toHaveBeenCalledTimes(2);
      expect(mockTaskService.countTasks).toHaveBeenCalledTimes(2);
    });
  });
});
