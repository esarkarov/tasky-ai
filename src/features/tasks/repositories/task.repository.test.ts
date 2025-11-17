import { env } from '@/core/config/env.config';
import { databases } from '@/core/lib/appwrite';
import { taskQueries } from '@/features/tasks/repositories/task.queries';
import { taskRepository } from '@/features/tasks/repositories/task.repository';
import { TaskCreateInput, Task, TasksResponse, TaskUpdateInput } from '@/features/tasks/types';
import { generateID } from '@/shared/utils/text/text.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env.config');

vi.mock('@/core/lib/appwrite', () => ({
  databases: {
    getDocument: vi.fn(),
    listDocuments: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
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

const mockedDatabases = vi.mocked(databases);
const mockedTaskQueries = vi.mocked(taskQueries);
const mockedGenerateID = vi.mocked(generateID);

describe('taskRepository', () => {
  const MOCK_DATABASE_ID = 'test-database-id';
  const MOCK_COLLECTION_ID = 'test-tasks-collection';
  const MOCK_TASK_ID = 'task-123';
  const MOCK_USER_ID = 'user-123';
  const MOCK_PROJECT_ID = 'project-123';
  const MOCK_TODAY_DATE = '2023-01-01T00:00:00.000Z';
  const MOCK_TOMORROW_DATE = '2023-01-02T00:00:00.000Z';
  const MOCK_QUERIES = ['query1'];

  const createMockTask = (overrides?: Partial<Task>): Task => ({
    $id: MOCK_TASK_ID,
    id: MOCK_TASK_ID,
    content: 'Test Task',
    due_date: new Date(),
    completed: false,
    projectId: null,
    $createdAt: '',
    $updatedAt: '',
    $permissions: [],
    $databaseId: '',
    $collectionId: '',
    ...overrides,
  });

  const createMockTasksResponse = (tasks: Task[] = [createMockTask()], total?: number): TasksResponse => ({
    documents: tasks,
    total: total ?? tasks.length,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    env.appwriteDatabaseId = MOCK_DATABASE_ID;
    env.appwriteTasksCollectionId = MOCK_COLLECTION_ID;
  });

  describe('count methods', () => {
    describe('countTodayTasks', () => {
      it('should return today task count', async () => {
        const expectedCount = 5;
        mockedTaskQueries.forTodayTasksCount.mockReturnValue(MOCK_QUERIES);
        mockedDatabases.listDocuments.mockResolvedValue(createMockTasksResponse([], expectedCount));

        const result = await taskRepository.countTodayTasks(MOCK_TODAY_DATE, MOCK_TOMORROW_DATE, MOCK_USER_ID);

        expect(mockedTaskQueries.forTodayTasksCount).toHaveBeenCalledWith(
          MOCK_TODAY_DATE,
          MOCK_TOMORROW_DATE,
          MOCK_USER_ID
        );
        expect(mockedDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
        expect(result).toBe(expectedCount);
      });

      it('should propagate error when query fails', async () => {
        mockedTaskQueries.forTodayTasksCount.mockReturnValue([]);
        mockedDatabases.listDocuments.mockRejectedValue(new Error('Query failed'));

        await expect(taskRepository.countTodayTasks(MOCK_TODAY_DATE, MOCK_TOMORROW_DATE, MOCK_USER_ID)).rejects.toThrow(
          'Query failed'
        );
      });
    });

    describe('countInboxTasks', () => {
      it('should return inbox task count', async () => {
        const expectedCount = 3;
        mockedTaskQueries.forInboxTasksCount.mockReturnValue(MOCK_QUERIES);
        mockedDatabases.listDocuments.mockResolvedValue(createMockTasksResponse([], expectedCount));

        const result = await taskRepository.countInboxTasks(MOCK_USER_ID);

        expect(mockedTaskQueries.forInboxTasksCount).toHaveBeenCalledWith(MOCK_USER_ID);
        expect(mockedDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
        expect(result).toBe(expectedCount);
      });

      it('should propagate error when query fails', async () => {
        mockedTaskQueries.forInboxTasksCount.mockReturnValue([]);
        mockedDatabases.listDocuments.mockRejectedValue(new Error('Query failed'));

        await expect(taskRepository.countInboxTasks(MOCK_USER_ID)).rejects.toThrow('Query failed');
      });
    });
  });

  describe('find methods', () => {
    describe('findCompletedTasks', () => {
      it('should return completed tasks', async () => {
        const mockResponse = createMockTasksResponse();
        mockedTaskQueries.forCompletedTasks.mockReturnValue(MOCK_QUERIES);
        mockedDatabases.listDocuments.mockResolvedValue(mockResponse);

        const result = await taskRepository.findCompletedTasks(MOCK_USER_ID);

        expect(mockedTaskQueries.forCompletedTasks).toHaveBeenCalledWith(MOCK_USER_ID);
        expect(mockedDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
        expect(result).toEqual(mockResponse);
      });

      it('should propagate error when query fails', async () => {
        mockedTaskQueries.forCompletedTasks.mockReturnValue([]);
        mockedDatabases.listDocuments.mockRejectedValue(new Error('Query failed'));

        await expect(taskRepository.findCompletedTasks(MOCK_USER_ID)).rejects.toThrow('Query failed');
      });
    });

    describe('findInboxTasks', () => {
      it('should return inbox tasks', async () => {
        const mockResponse = createMockTasksResponse();
        mockedTaskQueries.forInboxTasks.mockReturnValue(MOCK_QUERIES);
        mockedDatabases.listDocuments.mockResolvedValue(mockResponse);

        const result = await taskRepository.findInboxTasks(MOCK_USER_ID);

        expect(mockedTaskQueries.forInboxTasks).toHaveBeenCalledWith(MOCK_USER_ID);
        expect(mockedDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('findTodayTasks', () => {
      it('should return today tasks', async () => {
        const mockResponse = createMockTasksResponse();
        mockedTaskQueries.forTodayTasks.mockReturnValue(MOCK_QUERIES);
        mockedDatabases.listDocuments.mockResolvedValue(mockResponse);

        const result = await taskRepository.findTodayTasks(MOCK_TODAY_DATE, MOCK_TOMORROW_DATE, MOCK_USER_ID);

        expect(mockedTaskQueries.forTodayTasks).toHaveBeenCalledWith(MOCK_TODAY_DATE, MOCK_TOMORROW_DATE, MOCK_USER_ID);
        expect(mockedDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('findUpcomingTasks', () => {
      it('should return upcoming tasks', async () => {
        const mockResponse = createMockTasksResponse();
        mockedTaskQueries.forUpcomingTasks.mockReturnValue(MOCK_QUERIES);
        mockedDatabases.listDocuments.mockResolvedValue(mockResponse);

        const result = await taskRepository.findUpcomingTasks(MOCK_TODAY_DATE, MOCK_USER_ID);

        expect(mockedTaskQueries.forUpcomingTasks).toHaveBeenCalledWith(MOCK_TODAY_DATE, MOCK_USER_ID);
        expect(mockedDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('createMany', () => {
    const createMockTasksData = () => [
      { content: 'Task 1', due_date: new Date(), completed: false, projectId: null, userId: MOCK_USER_ID },
      {
        content: 'Task 2',
        due_date: null,
        completed: true,
        projectId: MOCK_PROJECT_ID,
        userId: MOCK_USER_ID,
        id: 'custom-id',
      },
    ];

    it('should create multiple tasks with generated and custom IDs', async () => {
      const tasksData = createMockTasksData();
      const mockGeneratedId = 'generated-id';
      const mockTask = createMockTask();
      mockedGenerateID.mockReturnValue(mockGeneratedId);
      mockedDatabases.createDocument.mockResolvedValue(mockTask);

      const result = await taskRepository.createMany(tasksData);

      expect(mockedGenerateID).toHaveBeenCalled();
      expect(mockedDatabases.createDocument).toHaveBeenCalledTimes(2);
      expect(mockedDatabases.createDocument).toHaveBeenCalledWith(
        MOCK_DATABASE_ID,
        MOCK_COLLECTION_ID,
        mockGeneratedId,
        expect.objectContaining({ content: 'Task 1' })
      );
      expect(mockedDatabases.createDocument).toHaveBeenCalledWith(
        MOCK_DATABASE_ID,
        MOCK_COLLECTION_ID,
        'custom-id',
        expect.objectContaining({ content: 'Task 2' })
      );
      expect(result).toEqual([mockTask, mockTask]);
    });

    it('should propagate error when creation fails', async () => {
      const tasksData = createMockTasksData();
      mockedGenerateID.mockReturnValue('generated-id');
      mockedDatabases.createDocument.mockRejectedValue(new Error('Create failed'));

      await expect(taskRepository.createMany(tasksData)).rejects.toThrow('Create failed');
    });
  });

  describe('create', () => {
    const createMockCreateData = (overrides?: Partial<TaskCreateInput>): TaskCreateInput => ({
      content: 'New Task',
      due_date: new Date(),
      completed: false,
      projectId: null,
      userId: MOCK_USER_ID,
      ...overrides,
    });

    it('should create task successfully', async () => {
      const createData = createMockCreateData();
      const mockTask = createMockTask();
      mockedDatabases.createDocument.mockResolvedValue(mockTask);

      const result = await taskRepository.create(MOCK_TASK_ID, createData);

      expect(mockedDatabases.createDocument).toHaveBeenCalledWith(
        MOCK_DATABASE_ID,
        MOCK_COLLECTION_ID,
        MOCK_TASK_ID,
        createData
      );
      expect(result).toEqual(mockTask);
    });

    it('should propagate error when creation fails', async () => {
      const createData = createMockCreateData();
      mockedDatabases.createDocument.mockRejectedValue(new Error('Create failed'));

      await expect(taskRepository.create(MOCK_TASK_ID, createData)).rejects.toThrow('Create failed');
    });
  });

  describe('update', () => {
    const createMockUpdateData = (overrides?: Partial<TaskUpdateInput>): TaskUpdateInput => ({
      content: 'Updated Task',
      due_date: new Date(),
      projectId: MOCK_PROJECT_ID,
      ...overrides,
    });

    it('should update task successfully', async () => {
      const updateData = createMockUpdateData();
      const updatedTask = createMockTask(updateData as Task);
      mockedDatabases.updateDocument.mockResolvedValue(updatedTask);

      const result = await taskRepository.update(MOCK_TASK_ID, updateData);

      expect(mockedDatabases.updateDocument).toHaveBeenCalledWith(
        MOCK_DATABASE_ID,
        MOCK_COLLECTION_ID,
        MOCK_TASK_ID,
        updateData
      );
      expect(result).toEqual(updatedTask);
    });

    it('should propagate error when update fails', async () => {
      const updateData = createMockUpdateData();
      mockedDatabases.updateDocument.mockRejectedValue(new Error('Update failed'));

      await expect(taskRepository.update(MOCK_TASK_ID, updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      mockedDatabases.deleteDocument.mockResolvedValue({});

      await taskRepository.delete(MOCK_TASK_ID);

      expect(mockedDatabases.deleteDocument).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_TASK_ID);
    });

    it('should propagate error when deletion fails', async () => {
      mockedDatabases.deleteDocument.mockRejectedValue(new Error('Delete failed'));

      await expect(taskRepository.delete(MOCK_TASK_ID)).rejects.toThrow('Delete failed');
    });
  });
});
