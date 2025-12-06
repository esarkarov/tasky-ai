import { env } from '@/core/config/env.config';
import { databases } from '@/core/lib/appwrite';
import { createMockTask, createMockTasks } from '@/core/test-setup/factories';
import { taskQueries } from '@/features/tasks/repositories/task.queries';
import { taskRepository } from '@/features/tasks/repositories/task.repository';
import { generateID } from '@/shared/utils/text/text.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/lib/appwrite', () => ({
  databases: {
    listDocuments: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

vi.mock('@/core/config/env.config', () => ({
  env: {
    appwriteDatabaseId: 'test-database',
    appwriteTasksCollectionId: 'test-tasks',
  },
}));

vi.mock('@/features/tasks/repositories/task.queries', () => ({
  taskQueries: {
    forTodayTasksCount: vi.fn(),
    forInboxTasksCount: vi.fn(),
    forCompletedTasks: vi.fn(),
    forInboxTasks: vi.fn(),
    forTodayTasks: vi.fn(),
    forUpcomingTasks: vi.fn(),
  },
}));

vi.mock('@/shared/utils/text/text.utils', () => ({
  generateID: vi.fn(),
}));

const mockDatabases = vi.mocked(databases);
const mockTaskQueries = vi.mocked(taskQueries);
const mockGenerateID = vi.mocked(generateID);

describe('taskRepository', () => {
  const MOCK_DATABASE_ID = 'test-database';
  const MOCK_COLLECTION_ID = 'test-tasks';
  const MOCK_TASK_ID = 'task-123';
  const MOCK_USER_ID = 'user-456';
  const MOCK_TODAY = '2025-01-01T00:00:00.000Z';
  const MOCK_TOMORROW = '2025-01-02T00:00:00.000Z';
  const MOCK_QUERIES = ['query1', 'query2'];

  beforeEach(() => {
    vi.clearAllMocks();
    env.appwriteDatabaseId = MOCK_DATABASE_ID;
    env.appwriteTasksCollectionId = MOCK_COLLECTION_ID;
  });

  describe('countTodayTasks', () => {
    it('should return count of today tasks', async () => {
      const expectedCount = 7;
      mockTaskQueries.forTodayTasksCount.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue({ total: expectedCount, documents: [] });

      const result = await taskRepository.countTodayTasks(MOCK_TODAY, MOCK_TOMORROW, MOCK_USER_ID);

      expect(mockTaskQueries.forTodayTasksCount).toHaveBeenCalledWith(MOCK_TODAY, MOCK_TOMORROW, MOCK_USER_ID);
      expect(mockTaskQueries.forTodayTasksCount).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
      expect(result).toBe(expectedCount);
    });

    it('should throw error when query fails', async () => {
      mockTaskQueries.forTodayTasksCount.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockRejectedValue(new Error('Database connection failed'));

      await expect(taskRepository.countTodayTasks(MOCK_TODAY, MOCK_TOMORROW, MOCK_USER_ID)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
    });
  });

  describe('countInboxTasks', () => {
    it('should return count of inbox tasks', async () => {
      const expectedCount = 5;
      mockTaskQueries.forInboxTasksCount.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue({ total: expectedCount, documents: [] });

      const result = await taskRepository.countInboxTasks(MOCK_USER_ID);

      expect(mockTaskQueries.forInboxTasksCount).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(mockTaskQueries.forInboxTasksCount).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
      expect(result).toBe(expectedCount);
    });

    it('should throw error when query fails', async () => {
      mockTaskQueries.forInboxTasksCount.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockRejectedValue(new Error('Query timeout'));

      await expect(taskRepository.countInboxTasks(MOCK_USER_ID)).rejects.toThrow('Query timeout');
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
    });
  });

  describe('findCompletedTasks', () => {
    it('should return completed tasks for user', async () => {
      const mockTasks = createMockTasks();
      mockTaskQueries.forCompletedTasks.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue(mockTasks);

      const result = await taskRepository.findCompletedTasks(MOCK_USER_ID);

      expect(mockTaskQueries.forCompletedTasks).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(mockTaskQueries.forCompletedTasks).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when query fails', async () => {
      mockTaskQueries.forCompletedTasks.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockRejectedValue(new Error('Database error'));

      await expect(taskRepository.findCompletedTasks(MOCK_USER_ID)).rejects.toThrow('Database error');
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
    });
  });

  describe('findInboxTasks', () => {
    it('should return inbox tasks for user', async () => {
      const mockTasks = createMockTasks();
      mockTaskQueries.forInboxTasks.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue(mockTasks);

      const result = await taskRepository.findInboxTasks(MOCK_USER_ID);

      expect(mockTaskQueries.forInboxTasks).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(mockTaskQueries.forInboxTasks).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when query fails', async () => {
      mockTaskQueries.forInboxTasks.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockRejectedValue(new Error('Database error'));

      await expect(taskRepository.findInboxTasks(MOCK_USER_ID)).rejects.toThrow('Database error');
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
    });
  });

  describe('findTodayTasks', () => {
    it('should return today tasks for user', async () => {
      const mockTasks = createMockTasks();
      mockTaskQueries.forTodayTasks.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue(mockTasks);

      const result = await taskRepository.findTodayTasks(MOCK_TODAY, MOCK_TOMORROW, MOCK_USER_ID);

      expect(mockTaskQueries.forTodayTasks).toHaveBeenCalledWith(MOCK_TODAY, MOCK_TOMORROW, MOCK_USER_ID);
      expect(mockTaskQueries.forTodayTasks).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when query fails', async () => {
      mockTaskQueries.forTodayTasks.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockRejectedValue(new Error('Database error'));

      await expect(taskRepository.findTodayTasks(MOCK_TODAY, MOCK_TOMORROW, MOCK_USER_ID)).rejects.toThrow(
        'Database error'
      );
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
    });
  });

  describe('findUpcomingTasks', () => {
    it('should return upcoming tasks for user', async () => {
      const mockTasks = createMockTasks();
      mockTaskQueries.forUpcomingTasks.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue(mockTasks);

      const result = await taskRepository.findUpcomingTasks(MOCK_TODAY, MOCK_USER_ID);

      expect(mockTaskQueries.forUpcomingTasks).toHaveBeenCalledWith(MOCK_TODAY, MOCK_USER_ID);
      expect(mockTaskQueries.forUpcomingTasks).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when query fails', async () => {
      mockTaskQueries.forUpcomingTasks.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockRejectedValue(new Error('Database error'));

      await expect(taskRepository.findUpcomingTasks(MOCK_TODAY, MOCK_USER_ID)).rejects.toThrow('Database error');
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
    });
  });

  describe('create', () => {
    it('should create task with provided data', async () => {
      const createData = {
        content: 'New task content',
        due_date: new Date('2025-12-31'),
        completed: false,
        projectId: 'project-789',
        userId: MOCK_USER_ID,
      };
      const createdTask = createMockTask();
      mockDatabases.createDocument.mockResolvedValue(createdTask);

      const result = await taskRepository.create(MOCK_TASK_ID, createData);

      expect(mockDatabases.createDocument).toHaveBeenCalledWith(
        MOCK_DATABASE_ID,
        MOCK_COLLECTION_ID,
        MOCK_TASK_ID,
        createData
      );
      expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
      expect(result).toEqual(createdTask);
    });

    it('should throw error when creation fails', async () => {
      const createData = {
        content: 'New task content',
        due_date: new Date('2025-12-31'),
        completed: false,
        projectId: null,
        userId: MOCK_USER_ID,
      };
      mockDatabases.createDocument.mockRejectedValue(new Error('Unique constraint violation'));

      await expect(taskRepository.create(MOCK_TASK_ID, createData)).rejects.toThrow('Unique constraint violation');
      expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
    });
  });

  describe('createMany', () => {
    it('should create multiple tasks successfully', async () => {
      const tasksToCreate = [
        {
          content: 'Task 1',
          due_date: null,
          completed: false,
          projectId: 'project-1',
          userId: MOCK_USER_ID,
        },
        {
          content: 'Task 2',
          due_date: null,
          completed: false,
          projectId: 'project-1',
          userId: MOCK_USER_ID,
        },
      ];
      const createdTasks = [
        createMockTask({ id: 'generated-1', content: 'Task 1' }),
        createMockTask({ id: 'generated-2', content: 'Task 2' }),
      ];
      mockGenerateID.mockReturnValueOnce('generated-1').mockReturnValueOnce('generated-2');
      mockDatabases.createDocument.mockResolvedValueOnce(createdTasks[0]).mockResolvedValueOnce(createdTasks[1]);

      const result = await taskRepository.createMany(tasksToCreate);

      expect(mockGenerateID).toHaveBeenCalledTimes(2);
      expect(mockDatabases.createDocument).toHaveBeenCalledTimes(2);
      expect(result).toEqual(createdTasks);
    });

    it('should use provided IDs when available', async () => {
      const tasksToCreate = [
        {
          id: 'custom-1',
          content: 'Task 1',
          due_date: null,
          completed: false,
          projectId: null,
          userId: MOCK_USER_ID,
        },
        {
          id: 'custom-2',
          content: 'Task 2',
          due_date: null,
          completed: false,
          projectId: null,
          userId: MOCK_USER_ID,
        },
      ];
      const createdTasks = [
        createMockTask({ id: 'custom-1', content: 'Task 1' }),
        createMockTask({ id: 'custom-2', content: 'Task 2' }),
      ];
      mockDatabases.createDocument.mockResolvedValueOnce(createdTasks[0]).mockResolvedValueOnce(createdTasks[1]);

      const result = await taskRepository.createMany(tasksToCreate);

      expect(mockGenerateID).not.toHaveBeenCalled();
      expect(mockDatabases.createDocument).toHaveBeenCalledTimes(2);
      expect(result).toEqual(createdTasks);
    });

    it('should throw error when any creation fails', async () => {
      const tasksToCreate = [
        {
          content: 'Task 1',
          due_date: null,
          completed: false,
          projectId: null,
          userId: MOCK_USER_ID,
        },
        {
          content: 'Task 2',
          due_date: null,
          completed: false,
          projectId: null,
          userId: MOCK_USER_ID,
        },
      ];
      mockGenerateID.mockReturnValue('generated-id');
      mockDatabases.createDocument
        .mockResolvedValueOnce(createMockTask())
        .mockRejectedValueOnce(new Error('Creation failed'));

      await expect(taskRepository.createMany(tasksToCreate)).rejects.toThrow('Creation failed');
      expect(mockDatabases.createDocument).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should update task with provided data', async () => {
      const updateData = {
        content: 'Updated task content',
        due_date: new Date('2025-12-25'),
        completed: true,
        projectId: null,
      };
      const updatedTask = createMockTask();
      mockDatabases.updateDocument.mockResolvedValue(updatedTask);

      const result = await taskRepository.update(MOCK_TASK_ID, updateData);

      expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
        MOCK_DATABASE_ID,
        MOCK_COLLECTION_ID,
        MOCK_TASK_ID,
        updateData
      );
      expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
      expect(result).toEqual(updatedTask);
    });

    it('should throw error when update fails', async () => {
      const updateData = {
        content: 'Updated task content',
        due_date: null,
        completed: false,
        projectId: null,
      };
      mockDatabases.updateDocument.mockRejectedValue(new Error('Task not found'));

      await expect(taskRepository.update(MOCK_TASK_ID, updateData)).rejects.toThrow('Task not found');
      expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      mockDatabases.deleteDocument.mockResolvedValue({});

      await taskRepository.delete(MOCK_TASK_ID);

      expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_TASK_ID);
      expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
    });

    it('should throw error when deletion fails', async () => {
      mockDatabases.deleteDocument.mockRejectedValue(new Error('Foreign key constraint'));

      await expect(taskRepository.delete(MOCK_TASK_ID)).rejects.toThrow('Foreign key constraint');
      expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
    });
  });
});
