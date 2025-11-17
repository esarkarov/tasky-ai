import type { Task, TaskFormInput } from '@/features/tasks/types';
import { HTTP_STATUS } from '@/shared/constants/http';
import { errorResponse, successResponse } from '@/shared/utils/response/response.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taskService } from './task.service';
import { taskActionHandlers } from './taskAction.handlers';

vi.mock('./task.service', () => ({
  taskService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/shared/utils/response/response.utils', () => ({
  errorResponse: vi.fn(),
  successResponse: vi.fn(),
}));

const mockTaskService = vi.mocked(taskService);
const mockErrorResponse = vi.mocked(errorResponse);
const mockSuccessResponse = vi.mocked(successResponse);

const createRequest = (body: object) =>
  new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify(body),
  });

const createMockTask = (overrides?: Partial<Task>): Task => ({
  $id: '1',
  id: 'task-1',
  content: 'Test task content',
  completed: false,
  due_date: null,
  projectId: null,
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $collectionId: 'tasks',
  $databaseId: 'tasks-db-123',
  $permissions: [],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('taskActionHandlers', () => {
  describe('handleCreate', () => {
    it('returns error when task content is missing or blank', async () => {
      const invalidData = { content: '   ' } as TaskFormInput;
      const request = createRequest(invalidData);

      await taskActionHandlers.handleCreate(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Task content is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockTaskService.create).not.toHaveBeenCalled();
    });

    it('creates task successfully with valid input', async () => {
      const validData: TaskFormInput = {
        content: 'New task',
        due_date: null,
        projectId: null,
      };
      const createdTask = createMockTask();

      const request = createRequest(validData);
      mockTaskService.create.mockResolvedValue(createdTask);

      await taskActionHandlers.handleCreate(request);

      expect(mockTaskService.create).toHaveBeenCalledWith(validData);
      expect(mockSuccessResponse).toHaveBeenCalledWith(
        'Task created successfully',
        { task: createdTask },
        HTTP_STATUS.CREATED
      );
    });
  });

  describe('handleUpdate', () => {
    it('returns error when ID is missing', async () => {
      const data = { content: 'Missing ID' } as TaskFormInput;
      const request = createRequest(data);

      await taskActionHandlers.handleUpdate(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Task ID is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockTaskService.update).not.toHaveBeenCalled();
    });

    it('updates task successfully with valid ID', async () => {
      const data: TaskFormInput = {
        id: 'task-2',
        content: 'Updated task',
        due_date: null,
        projectId: null,
      };
      const updatedTask = createMockTask();

      const request = createRequest(data);
      mockTaskService.update.mockResolvedValue(updatedTask);

      await taskActionHandlers.handleUpdate(request);

      expect(mockTaskService.update).toHaveBeenCalledWith('task-2', {
        content: 'Updated task',
        due_date: null,
        projectId: null,
      });
      expect(mockSuccessResponse).toHaveBeenCalledWith('Task updated successfully', {
        task: updatedTask,
      });
    });
  });

  describe('handleDelete', () => {
    it('returns error when ID is missing', async () => {
      const request = createRequest({});

      await taskActionHandlers.handleDelete(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Task ID is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockTaskService.delete).not.toHaveBeenCalled();
    });

    it('deletes task successfully with valid ID', async () => {
      const request = createRequest({ id: 'task-3' });

      await taskActionHandlers.handleDelete(request);

      expect(mockTaskService.delete).toHaveBeenCalledWith('task-3');
      expect(mockSuccessResponse).toHaveBeenCalledWith('Task deleted successfully');
    });
  });
});
