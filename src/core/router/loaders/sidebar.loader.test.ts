import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sidebarLoader } from '@/core/router/loaders/sidebar.loader';
import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';
import type { ProjectListItem, ProjectsListResponse } from '@/features/projects/types';
import type { TaskCounts } from '@/features/tasks/types';
import { SidebarLoaderData } from '@/shared/types';

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

const createMockProject = (overrides: Partial<ProjectListItem> = {}): ProjectListItem => ({
  $id: 'project-1',
  $collectionId: 'projects',
  $databaseId: 'db1',
  $permissions: [],
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  name: 'Test Project',
  color_name: 'gray',
  color_hex: '#cccccc',
  ...overrides,
});

const createMockProjects = (docs: ProjectListItem[] = [createMockProject()]): ProjectsListResponse => ({
  total: docs.length,
  documents: docs,
});

const createMockTaskCounts = (today = 3, inbox = 1): TaskCounts => ({
  todayTasks: today,
  inboxTasks: inbox,
});

const createLoaderArgs = () => ({
  request: new Request('http://localhost'),
  params: {},
  context: {},
  unstable_pattern: '',
});

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

      const result = await sidebarLoader(createLoaderArgs());

      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(mockTaskService.countTasks).toHaveBeenCalledOnce();
      expect(result).toEqual({ projects: mockProjects, taskCounts: mockTaskCounts });
    });

    it('returns empty projects and zero task counts', async () => {
      const emptyProjects = createMockProjects([]);
      const zeroCounts = createMockTaskCounts(0, 0);
      mockProjectService.findRecent.mockResolvedValue(emptyProjects);
      mockTaskService.countTasks.mockResolvedValue(zeroCounts);

      const result = await sidebarLoader(createLoaderArgs());

      expect(result).toEqual({ projects: emptyProjects, taskCounts: zeroCounts });
    });

    it('calls both services in parallel', async () => {
      const projects = createMockProjects();
      const taskCounts = createMockTaskCounts();
      const getRecentSpy = vi.spyOn(projectService, 'findRecent');
      const getCountsSpy = vi.spyOn(taskService, 'countTasks');

      mockProjectService.findRecent.mockResolvedValue(projects);
      mockTaskService.countTasks.mockResolvedValue(taskCounts);

      const result = await sidebarLoader(createLoaderArgs());

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

      await expect(sidebarLoader(createLoaderArgs())).rejects.toThrow('Failed to fetch projects');

      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(mockTaskService.countTasks).toHaveBeenCalledOnce();
    });

    it('throws if taskService fails', async () => {
      const projects = createMockProjects();
      mockProjectService.findRecent.mockResolvedValue(projects);
      mockTaskService.countTasks.mockRejectedValue(new Error('Failed to fetch tasks'));

      await expect(sidebarLoader(createLoaderArgs())).rejects.toThrow('Failed to fetch tasks');
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(mockTaskService.countTasks).toHaveBeenCalledOnce();
    });

    it('throws the first error if both services fail', async () => {
      mockProjectService.findRecent.mockRejectedValue(new Error('Project error'));
      mockTaskService.countTasks.mockRejectedValue(new Error('Task error'));

      await expect(sidebarLoader(createLoaderArgs())).rejects.toThrow('Project error');
    });
  });

  describe('edge cases', () => {
    it('handles empty responses gracefully', async () => {
      mockProjectService.findRecent.mockResolvedValue({ total: 0, documents: [] });
      mockTaskService.countTasks.mockResolvedValue({ todayTasks: 0, inboxTasks: 0 });

      const result = (await sidebarLoader(createLoaderArgs())) as SidebarLoaderData;
      expect(result.projects.total).toBe(0);
      expect(result.taskCounts.todayTasks).toBe(0);
    });

    it('supports multiple consecutive calls without state leakage', async () => {
      const mockProjects = createMockProjects();
      const mockCounts = createMockTaskCounts();

      mockProjectService.findRecent.mockResolvedValue(mockProjects);
      mockTaskService.countTasks.mockResolvedValue(mockCounts);

      const first = await sidebarLoader(createLoaderArgs());
      const second = await sidebarLoader(createLoaderArgs());

      expect(first).toEqual(second);
      expect(mockProjectService.findRecent).toHaveBeenCalledTimes(2);
      expect(mockTaskService.countTasks).toHaveBeenCalledTimes(2);
    });
  });
});
