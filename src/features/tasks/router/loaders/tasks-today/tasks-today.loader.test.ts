import { createMockProject, createMockProjects, createMockTask, createMockTasks } from '@/core/test-setup/factories';
import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';
import type { ProjectsWithTasksLoaderData, TasksLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tasksTodayLoader } from './tasks-today.loader';

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

      mockTaskService.findTodayTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksTodayLoader()) as ProjectsWithTasksLoaderData;

      expect(mockTaskService.findTodayTasks).toHaveBeenCalledOnce();
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(result.tasks).toEqual(tasks);
      expect(result.projects).toEqual(projects);
    });

    it('includes tasks with a due date of today', async () => {
      const today = new Date();
      const tasks = createMockTasks([createMockTask({ content: 'Due today', due_date: today })]);
      const projects = createMockProjects();

      mockTaskService.findTodayTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksTodayLoader()) as TasksLoaderData;

      expect(result.tasks.documents[0].due_date).toEqual(today);
    });

    it('includes tasks linked to a project', async () => {
      const project = createMockProject();
      const tasks = createMockTasks([createMockTask({ content: 'Project task', projectId: project })]);
      const projects = createMockProjects();

      mockTaskService.findTodayTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksTodayLoader()) as TasksLoaderData;

      expect(result.tasks.documents[0].projectId?.$id).toBe(project.$id);
    });
  });

  describe('empty state', () => {
    it('returns empty task list when no today tasks exist', async () => {
      const tasks = createMockTasks([]);
      const projects = createMockProjects();

      mockTaskService.findTodayTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksTodayLoader()) as TasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.tasks.documents).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('throws if task service fails', async () => {
      mockTaskService.findTodayTasks.mockRejectedValue(new Error('Task error'));

      await expect(tasksTodayLoader()).rejects.toThrow('Task error');
    });

    it('throws if project service fails', async () => {
      const tasks = createMockTasks();
      mockTaskService.findTodayTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockRejectedValue(new Error('Project error'));

      await expect(tasksTodayLoader()).rejects.toThrow('Project error');
    });
  });

  describe('data validation', () => {
    it('returns valid TasksLoaderData shape', async () => {
      const tasks = createMockTasks();
      const projects = createMockProjects();

      mockTaskService.findTodayTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksTodayLoader()) as TasksLoaderData;

      expect(result).toHaveProperty('tasks');
      expect(result.tasks.total).toBe(1);
      expect(result.tasks.documents).toHaveLength(1);
    });
  });
});
