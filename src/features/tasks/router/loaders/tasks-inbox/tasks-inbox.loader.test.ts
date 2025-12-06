import { createMockProjects, createMockTask, createMockTasks } from '@/core/test-setup/factories';
import { projectService } from '@/features/projects/services/project.service';
import { tasksInboxLoader } from '@/features/tasks/router/loaders/tasks-inbox/tasks-inbox.loader';
import { taskService } from '@/features/tasks/services/task.service';
import type { ProjectsWithTasksLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('tasksInboxLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful data loading', () => {
    it('should return inbox tasks and recent projects', async () => {
      const mockTasks = createMockTasks([
        createMockTask({ content: 'Inbox task 1' }),
        createMockTask({ id: '2', $id: 'task-456', content: 'Inbox task 2', completed: true }),
      ]);
      const mockProjects = createMockProjects();
      mockTaskService.findInboxTasks.mockResolvedValue(mockTasks);
      mockProjectService.findRecent.mockResolvedValue(mockProjects);

      const result = (await tasksInboxLoader()) as ProjectsWithTasksLoaderData;

      expect(result).toEqual({
        tasks: mockTasks,
        projects: mockProjects,
      });
      expect(mockTaskService.findInboxTasks).toHaveBeenCalledOnce();
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
    });

    it('should return empty collections when no data exists', async () => {
      const emptyTasks = createMockTasks([]);
      const emptyProjects = createMockProjects([]);
      mockTaskService.findInboxTasks.mockResolvedValue(emptyTasks);
      mockProjectService.findRecent.mockResolvedValue(emptyProjects);

      const result = (await tasksInboxLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.total).toBe(0);
      expect(result.projects.total).toBe(0);
    });

    it('should preserve task due dates', async () => {
      const dueDate = new Date('2025-01-01');
      const taskWithDueDate = createMockTask({ content: 'Task with date', due_date: dueDate });
      const tasks = createMockTasks([taskWithDueDate]);
      const projects = createMockProjects();
      mockTaskService.findInboxTasks.mockResolvedValue(tasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksInboxLoader()) as ProjectsWithTasksLoaderData;

      expect(result.tasks.documents[0].due_date).toEqual(dueDate);
    });

    it('should ensure inbox tasks have no project assignment', async () => {
      const mockTasks = createMockTasks([
        createMockTask({ content: 'Inbox task 1' }),
        createMockTask({ id: '2', $id: 'task-456', content: 'Inbox task 2' }),
      ]);
      const projects = createMockProjects();
      mockTaskService.findInboxTasks.mockResolvedValue(mockTasks);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await tasksInboxLoader()) as ProjectsWithTasksLoaderData;

      const allTasksAreInbox = result.tasks.documents.every((task) => task.projectId === null);
      expect(allTasksAreInbox).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error when task service fails', async () => {
      mockTaskService.findInboxTasks.mockRejectedValue(new Error('Task service failed'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(tasksInboxLoader()).rejects.toThrow('Task service failed');
    });

    it('should throw error when project service fails', async () => {
      mockTaskService.findInboxTasks.mockResolvedValue(createMockTasks());
      mockProjectService.findRecent.mockRejectedValue(new Error('Project service failed'));

      await expect(tasksInboxLoader()).rejects.toThrow('Project service failed');
    });
  });
});
