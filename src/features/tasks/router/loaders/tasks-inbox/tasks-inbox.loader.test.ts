import { createMockLoaderArgs, createMockProjects, createMockTask, createMockTasks } from '@/core/tests/factories';
import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';
import type { ProjectsWithTasksLoaderData, TasksLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tasksInboxLoader } from './tasks-inbox.loader';

vi.mock('@/features/tasks/services/task.service', () => ({
  taskService: {
    findInboxTasks: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    findRecent: vi.fn(),
  },
}));

const mockTaskService = vi.mocked(taskService);
const mockProjectService = vi.mocked(projectService);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tasksInboxLoader', () => {
  describe('success cases', () => {
    it('returns inbox tasks and recent projects', async () => {
      const tasks = createMockTasks([
        createMockTask({ content: 'Inbox 1' }),
        createMockTask({ id: '2', $id: 'task-456', content: 'Inbox 2', completed: true }),
      ]);
      const projects = createMockProjects();

      mockTaskService.findInboxTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksInboxLoader(createMockLoaderArgs())) as ProjectsWithTasksLoaderData;

      expect(result.tasks).toEqual(tasks);
      expect(result.projects).toEqual(projects);
      expect(mockTaskService.findInboxTasks).toHaveBeenCalledOnce();
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
    });

    it('handles inbox tasks with due dates', async () => {
      const tasks = createMockTasks([createMockTask({ content: 'With date', due_date: new Date('2025-01-01') })]);
      const projects = createMockProjects();

      mockTaskService.findInboxTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksInboxLoader(createMockLoaderArgs())) as TasksLoaderData;

      expect(result.tasks.documents[0].due_date).toBeInstanceOf(Date);
    });

    it('ensures all inbox tasks have no projectId', async () => {
      const tasks = createMockTasks([
        createMockTask({ content: 'Inbox 1' }),
        createMockTask({ id: '2', $id: 'task-456', content: 'Inbox 2' }),
      ]);
      const projects = createMockProjects();

      mockTaskService.findInboxTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksInboxLoader(createMockLoaderArgs())) as TasksLoaderData;

      const allAreInbox = result.tasks.documents.every((task) => task.projectId === null);
      expect(allAreInbox).toBe(true);
    });
  });

  describe('empty state', () => {
    it('returns empty tasks and projects arrays', async () => {
      const tasks = createMockTasks([]);
      const projects = createMockProjects([]);

      mockTaskService.findInboxTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksInboxLoader(createMockLoaderArgs())) as ProjectsWithTasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.projects.total).toBe(0);
    });
  });

  describe('error handling', () => {
    it('throws if task service fails', async () => {
      mockTaskService.findInboxTasks.mockRejectedValue(new Error('Task service error'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(tasksInboxLoader(createMockLoaderArgs())).rejects.toThrow('Task service error');
    });

    it('throws if project service fails', async () => {
      mockTaskService.findInboxTasks.mockResolvedValue(createMockTasks());
      mockProjectService.findRecent.mockRejectedValue(new Error('Project service error'));

      await expect(tasksInboxLoader(createMockLoaderArgs())).rejects.toThrow('Project service error');
    });
  });

  describe('data validation', () => {
    it('returns a valid TasksLoaderData shape', async () => {
      const tasks = createMockTasks();
      const projects = createMockProjects();

      mockTaskService.findInboxTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksInboxLoader(createMockLoaderArgs())) as ProjectsWithTasksLoaderData;

      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('projects');
      expect(Array.isArray(result.tasks.documents)).toBe(true);
      expect(Array.isArray(result.projects.documents)).toBe(true);
    });
  });
});
