import { projectService } from '@/features/projects/services/project.service';
import type { ProjectEntity, ProjectsListResponse } from '@/features/projects/types';
import { taskService } from '@/features/tasks/services/task.service';
import type { TaskEntity, TasksResponse } from '@/features/tasks/types';
import type { ProjectsWithTasksLoaderData, TasksLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tasksUpcomingLoader } from './tasks-upcoming.loader';

vi.mock('@/features/tasks/services/task.service', () => ({
  taskService: {
    getUpcomingTasks: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    getRecent: vi.fn(),
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
  $id: 'task-1',
  content: 'Mock Task',
  completed: false,
  due_date: new Date('2025-12-12'),
  projectId: null,
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $collectionId: 'tasks',
  $databaseId: 'db',
  $permissions: [],
  ...overrides,
});

const createMockProject = (overrides: Partial<ProjectEntity> = {}): ProjectEntity => ({
  $id: 'project-1',
  userId: 'user-1',
  name: 'Project A',
  color_name: 'blue',
  color_hex: '#0000FF',
  tasks: [],
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $collectionId: 'projects',
  $databaseId: 'db',
  $permissions: [],
  ...overrides,
});

const createMockTasks = (documents: TaskEntity[] = [createMockTask()]): TasksResponse => ({
  total: documents.length,
  documents,
});

const createMockProjects = (documents: ProjectEntity[] = [createMockProject()]): ProjectsListResponse => ({
  total: documents.length,
  documents,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tasksUpcomingLoader', () => {
  describe('success cases', () => {
    it('returns upcoming tasks and recent projects', async () => {
      const tasks = createMockTasks();
      const projects = createMockProjects();

      mockTaskService.getUpcomingTasks.mockResolvedValue(tasks);
      mockProjectService.getRecent.mockResolvedValue(projects);

      const result = (await tasksUpcomingLoader(createLoaderArgs())) as ProjectsWithTasksLoaderData;

      expect(result.tasks).toEqual(tasks);
      expect(result.projects).toEqual(projects);
      expect(mockTaskService.getUpcomingTasks).toHaveBeenCalledOnce();
      expect(mockProjectService.getRecent).toHaveBeenCalledOnce();
    });

    it('handles empty task and project responses', async () => {
      const emptyTasks = createMockTasks([]);
      const emptyProjects = createMockProjects([]);

      mockTaskService.getUpcomingTasks.mockResolvedValue(emptyTasks);
      mockProjectService.getRecent.mockResolvedValue(emptyProjects);

      const result = (await tasksUpcomingLoader(createLoaderArgs())) as ProjectsWithTasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.projects.total).toBe(0);
    });

    it('returns tasks with a valid future due date', async () => {
      const dueDate = new Date('2025-12-25');
      const tasks = createMockTasks([createMockTask({ due_date: dueDate })]);
      const projects = createMockProjects();

      mockTaskService.getUpcomingTasks.mockResolvedValue(tasks);
      mockProjectService.getRecent.mockResolvedValue(projects);

      const result = (await tasksUpcomingLoader(createLoaderArgs())) as TasksLoaderData;

      expect(result.tasks.documents[0].due_date).toEqual(dueDate);
    });

    it('returns tasks with linked project references', async () => {
      const project = createMockProject();
      const tasks = createMockTasks([createMockTask({ projectId: project })]);
      const projects = createMockProjects([project]);

      mockTaskService.getUpcomingTasks.mockResolvedValue(tasks);
      mockProjectService.getRecent.mockResolvedValue(projects);

      const result = (await tasksUpcomingLoader(createLoaderArgs())) as TasksLoaderData;

      expect(result.tasks.documents[0].projectId?.$id).toBe(project.$id);
    });
  });

  describe('empty state', () => {
    it('returns empty task list when no upcoming tasks exist', async () => {
      const tasks = createMockTasks([]);
      const projects = createMockProjects();

      mockTaskService.getUpcomingTasks.mockResolvedValue(tasks);
      mockProjectService.getRecent.mockResolvedValue(projects);

      const result = (await tasksUpcomingLoader(createLoaderArgs())) as TasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.tasks.documents).toHaveLength(0);
    });
  });

  describe('failure cases', () => {
    it('throws if getUpcomingTasks fails', async () => {
      mockTaskService.getUpcomingTasks.mockRejectedValue(new Error('Task error'));
      mockProjectService.getRecent.mockResolvedValue(createMockProjects());

      await expect(tasksUpcomingLoader(createLoaderArgs())).rejects.toThrow('Task error');
    });

    it('throws if getRecent fails', async () => {
      mockTaskService.getUpcomingTasks.mockResolvedValue(createMockTasks());
      mockProjectService.getRecent.mockRejectedValue(new Error('Project error'));

      await expect(tasksUpcomingLoader(createLoaderArgs())).rejects.toThrow('Project error');
    });
  });

  describe('data validation', () => {
    it('returns valid TasksLoaderData shape', async () => {
      const tasks = createMockTasks();
      const projects = createMockProjects();

      mockTaskService.getUpcomingTasks.mockResolvedValue(tasks);
      mockProjectService.getRecent.mockResolvedValue(projects);

      const result = (await tasksUpcomingLoader(createLoaderArgs())) as ProjectsWithTasksLoaderData;

      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('projects');
      expect(result.tasks.documents).toBeInstanceOf(Array);
      expect(result.projects.documents).toBeInstanceOf(Array);
    });
  });
});
