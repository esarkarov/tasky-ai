import { createMockTask } from '@/core/test-setup/factories';
import { taskService } from '@/features/tasks/services/task.service';
import { taskActionHandlers } from '@/features/tasks/services/taskAction.handlers';
import type { TaskFormInput } from '@/features/tasks/types';
import { HTTP_STATUS } from '@/shared/constants';
import { errorResponse, successResponse } from '@/shared/utils/response/response.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('taskActionHandlers', () => {
  const createMockRequest = (body: Partial<TaskFormInput> | { id?: string }) =>
    new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleCreate', () => {
    describe('validation', () => {
      it('should return error when task content is empty', async () => {
        const invalidData: Partial<TaskFormInput> = { content: '' };
        const request = createMockRequest(invalidData);

        await taskActionHandlers.handleCreate(request);

        expect(mockErrorResponse).toHaveBeenCalledWith('Task content is required', HTTP_STATUS.BAD_REQUEST);
        expect(mockTaskService.create).not.toHaveBeenCalled();
      });

      it('should return error when task content is only whitespace', async () => {
        const invalidData: Partial<TaskFormInput> = { content: '   ' };
        const request = createMockRequest(invalidData);

        await taskActionHandlers.handleCreate(request);

        expect(mockErrorResponse).toHaveBeenCalledWith('Task content is required', HTTP_STATUS.BAD_REQUEST);
        expect(mockTaskService.create).not.toHaveBeenCalled();
      });
    });

    describe('successful task creation', () => {
      it('should create task with valid input', async () => {
        const validData: Partial<TaskFormInput> = {
          content: 'Complete project documentation',
          due_date: null,
          projectId: null,
        };
        const createdTask = createMockTask();
        const request = createMockRequest(validData);
        mockTaskService.create.mockResolvedValue(createdTask);

        await taskActionHandlers.handleCreate(request);

        expect(mockTaskService.create).toHaveBeenCalledWith(validData);
        expect(mockTaskService.create).toHaveBeenCalledOnce();
        expect(mockSuccessResponse).toHaveBeenCalledWith(
          'Task created successfully',
          { task: createdTask },
          HTTP_STATUS.CREATED
        );
        expect(mockSuccessResponse).toHaveBeenCalledOnce();
      });
    });
  });

  describe('handleUpdate', () => {
    it('should return error when task ID is missing', async () => {
      const invalidData: Partial<TaskFormInput> = { content: 'Task without ID' };
      const request = createMockRequest(invalidData);

      await taskActionHandlers.handleUpdate(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Task ID is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockTaskService.update).not.toHaveBeenCalled();
    });

    it('should update task with valid ID and data', async () => {
      const dueDate = new Date('2025-12-31');
      const data: Partial<TaskFormInput> = {
        id: 'task-123',
        content: 'Updated task content',
        due_date: dueDate,
        projectId: 'project-456',
      };
      const updatedTask = createMockTask();
      const request = createMockRequest(data);
      mockTaskService.update.mockResolvedValue(updatedTask);

      await taskActionHandlers.handleUpdate(request);

      expect(mockTaskService.update).toHaveBeenCalledWith('task-123', {
        content: 'Updated task content',
        due_date: dueDate.toISOString(),
        projectId: 'project-456',
      });
      expect(mockTaskService.update).toHaveBeenCalledOnce();
      expect(mockSuccessResponse).toHaveBeenCalledWith('Task updated successfully', {
        task: updatedTask,
      });
      expect(mockSuccessResponse).toHaveBeenCalledOnce();
    });
  });

  describe('handleDelete', () => {
    it('should return error when task ID is missing', async () => {
      const request = createMockRequest({});

      await taskActionHandlers.handleDelete(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Task ID is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockTaskService.delete).not.toHaveBeenCalled();
    });

    it('should delete task with valid ID', async () => {
      const request = createMockRequest({ id: 'task-789' });

      await taskActionHandlers.handleDelete(request);

      expect(mockTaskService.delete).toHaveBeenCalledWith('task-789');
      expect(mockTaskService.delete).toHaveBeenCalledOnce();
      expect(mockSuccessResponse).toHaveBeenCalledWith('Task deleted successfully');
      expect(mockSuccessResponse).toHaveBeenCalledOnce();
    });
  });
});
