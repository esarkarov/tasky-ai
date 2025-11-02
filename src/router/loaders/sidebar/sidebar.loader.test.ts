import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sidebarLoader } from './sidebar.loader';
import { projectService } from '@/services/project/project.service';
import { taskService } from '@/services/task/task.service';
import type { ProjectsListResponse, ProjectListItem } from '@/types/projects.types';
import type { TaskCounts } from '@/types/tasks.types';

vi.mock('@/services/project/project.service', () => ({
  projectService: {
    getRecentProjects: vi.fn(),
  },
}));

vi.mock('@/services/task/task.service', () => ({
  taskService: {
    getTaskCounts: vi.fn(),
  },
}));

const mockProjectService = vi.mocked(projectService);
const mockTaskService = vi.mocked(taskService);

const createLoaderArgs = () => ({
  request: new Request('http://localhost'),
  params: {},
  context: {},
});

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('appLoader', () => {
  it('returns recent projects and task counts', async () => {
    const mockProjects = createMockProjects();
    const mockTaskCounts = createMockTaskCounts();

    mockProjectService.getRecentProjects.mockResolvedValue(mockProjects);
    mockTaskService.getTaskCounts.mockResolvedValue(mockTaskCounts);

    const result = await sidebarLoader(createLoaderArgs());

    expect(mockProjectService.getRecentProjects).toHaveBeenCalledOnce();
    expect(mockTaskService.getTaskCounts).toHaveBeenCalledOnce();
    expect(result).toEqual({ projects: mockProjects, taskCounts: mockTaskCounts });
  });

  it('returns empty projects and zero task counts', async () => {
    const emptyProjects = createMockProjects([]);
    const zeroTaskCounts = createMockTaskCounts(0, 0);

    mockProjectService.getRecentProjects.mockResolvedValue(emptyProjects);
    mockTaskService.getTaskCounts.mockResolvedValue(zeroTaskCounts);

    const result = await sidebarLoader(createLoaderArgs());

    expect(result).toEqual({ projects: emptyProjects, taskCounts: zeroTaskCounts });
  });

  describe('error handling', () => {
    it('throws if projectService fails', async () => {
      const error = new Error('Failed to fetch projects');
      mockProjectService.getRecentProjects.mockRejectedValue(error);

      await expect(sidebarLoader(createLoaderArgs())).rejects.toThrow('Failed to fetch projects');
    });

    it('throws if taskService fails', async () => {
      const projects = createMockProjects();
      mockProjectService.getRecentProjects.mockResolvedValue(projects);
      mockTaskService.getTaskCounts.mockRejectedValue(new Error('Failed to fetch tasks'));

      await expect(sidebarLoader(createLoaderArgs())).rejects.toThrow('Failed to fetch tasks');
    });

    it('throws the first error if both services fail', async () => {
      mockProjectService.getRecentProjects.mockRejectedValue(new Error('Project error'));
      mockTaskService.getTaskCounts.mockRejectedValue(new Error('Task error'));

      await expect(sidebarLoader(createLoaderArgs())).rejects.toThrow('Project error');
    });
  });

  it('calls both services in parallel', async () => {
    const projects = createMockProjects();
    const taskCounts = createMockTaskCounts();

    const getRecentProjectsSpy = vi.spyOn(projectService, 'getRecentProjects');
    const getTaskCountsSpy = vi.spyOn(taskService, 'getTaskCounts');

    mockProjectService.getRecentProjects.mockResolvedValue(projects);
    mockTaskService.getTaskCounts.mockResolvedValue(taskCounts);

    const result = await sidebarLoader(createLoaderArgs());

    expect(getRecentProjectsSpy).toHaveBeenCalledOnce();
    expect(getTaskCountsSpy).toHaveBeenCalledOnce();
    expect(result).toEqual({ projects, taskCounts });
  });
});
