import { projectService } from '@/services/project/project.service';
import { taskService } from '@/services/task/task.service';
import type { ProjectTaskLoaderData, TasksLoaderData } from '@/types/loaders.types';
import type { ProjectEntity, ProjectListItem, ProjectsListResponse } from '@/types/projects.types';
import type { TaskEntity, TasksResponse } from '@/types/tasks.types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tasksTodayLoader } from './tasks-today.loader';

vi.mock('@/services/task/task.service', () => ({
  taskService: {
    getTodayTasks: vi.fn(),
  },
}));

vi.mock('@/services/project/project.service', () => ({
  projectService: {
    getRecentProjects: vi.fn(),
  },
}));

const mockTaskService = vi.mocked(taskService);
const mockProjectService = vi.mocked(projectService);

const createLoaderArgs = () => ({
  request: new Request('http://localhost'),
  params: {},
  context: {},
});

const createMockTask = (overrides: Partial<TaskEntity> = {}): TaskEntity => ({
  id: '1',
  $id: 'task-123',
  content: 'Today task',
  completed: false,
  due_date: null,
  projectId: null,
  $createdAt: '2025-10-15T00:00:00.000Z',
  $updatedAt: '2025-10-15T00:00:00.000Z',
  $collectionId: 'tasks',
  $databaseId: 'default',
  $permissions: [],
  ...overrides,
});

const createMockTasks = (documents: TaskEntity[] = [createMockTask()]): TasksResponse => ({
  total: documents.length,
  documents,
});

const createMockProject = (overrides: Partial<ProjectListItem> = {}): ProjectEntity => ({
  $id: 'project-1',
  userId: 'user-123',
  name: 'Work Project',
  color_name: 'red',
  color_hex: '#FF0000',
  $createdAt: '2023-01-01T00:00:00.000Z',
  $updatedAt: '2023-01-01T00:00:00.000Z',
  $collectionId: 'projects',
  $databaseId: 'default',
  $permissions: [],
  tasks: [],
  ...overrides,
});

const createMockProjects = (documents: ProjectListItem[] = [createMockProject()]): ProjectsListResponse => ({
  total: documents.length,
  documents,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tasksTodayLoader', () => {
  describe('success cases', () => {
    it('returns today tasks and projects', async () => {
      const tasks = createMockTasks([
        createMockTask({ $id: 'task-1', content: 'Today task 1' }),
        createMockTask({ $id: 'task-2', content: 'Today task 2', completed: true }),
      ]);
      const projects = createMockProjects();

      mockTaskService.getTodayTasks.mockResolvedValue(tasks);
      mockProjectService.getRecentProjects.mockResolvedValue(projects);

      const result = (await tasksTodayLoader(createLoaderArgs())) as ProjectTaskLoaderData;

      expect(mockTaskService.getTodayTasks).toHaveBeenCalledOnce();
      expect(mockProjectService.getRecentProjects).toHaveBeenCalledOnce();
      expect(result.tasks).toEqual(tasks);
      expect(result.projects).toEqual(projects);
    });

    it('includes tasks with a due date of today', async () => {
      const today = new Date();
      const tasks = createMockTasks([createMockTask({ content: 'Due today', due_date: today })]);
      const projects = createMockProjects();

      mockTaskService.getTodayTasks.mockResolvedValue(tasks);
      mockProjectService.getRecentProjects.mockResolvedValue(projects);

      const result = (await tasksTodayLoader(createLoaderArgs())) as TasksLoaderData;

      expect(result.tasks.documents[0].due_date).toEqual(today);
    });

    it('includes tasks linked to a project', async () => {
      const project = createMockProject();
      const tasks = createMockTasks([createMockTask({ content: 'Project task', projectId: project })]);
      const projects = createMockProjects();

      mockTaskService.getTodayTasks.mockResolvedValue(tasks);
      mockProjectService.getRecentProjects.mockResolvedValue(projects);

      const result = (await tasksTodayLoader(createLoaderArgs())) as TasksLoaderData;

      expect(result.tasks.documents[0].projectId?.$id).toBe(project.$id);
    });
  });

  describe('empty state', () => {
    it('returns empty task list when no today tasks exist', async () => {
      const tasks = createMockTasks([]);
      const projects = createMockProjects();

      mockTaskService.getTodayTasks.mockResolvedValue(tasks);
      mockProjectService.getRecentProjects.mockResolvedValue(projects);

      const result = (await tasksTodayLoader(createLoaderArgs())) as TasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.tasks.documents).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('throws if task service fails', async () => {
      mockTaskService.getTodayTasks.mockRejectedValue(new Error('Task error'));

      await expect(tasksTodayLoader(createLoaderArgs())).rejects.toThrow('Task error');
    });

    it('throws if project service fails', async () => {
      const tasks = createMockTasks();
      mockTaskService.getTodayTasks.mockResolvedValue(tasks);
      mockProjectService.getRecentProjects.mockRejectedValue(new Error('Project error'));

      await expect(tasksTodayLoader(createLoaderArgs())).rejects.toThrow('Project error');
    });
  });

  describe('data validation', () => {
    it('returns valid TasksLoaderData shape', async () => {
      const tasks = createMockTasks();
      const projects = createMockProjects();

      mockTaskService.getTodayTasks.mockResolvedValue(tasks);
      mockProjectService.getRecentProjects.mockResolvedValue(projects);

      const result = (await tasksTodayLoader(createLoaderArgs())) as TasksLoaderData;

      expect(result).toHaveProperty('tasks');
      expect(result.tasks.total).toBe(1);
      expect(result.tasks.documents).toHaveLength(1);
    });
  });
});
