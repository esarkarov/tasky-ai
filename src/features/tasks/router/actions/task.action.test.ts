import { createMockActionArgs, createMockRequest } from '@/core/test-setup/factories';
import { taskAction } from '@/features/tasks/router/actions/task.action';
import { taskActionHandlers } from '@/features/tasks/services/taskAction.handlers';
import { HTTP_METHODS, HTTP_STATUS } from '@/shared/constants';
import { errorResponse } from '@/shared/utils/response/response.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tasks/services/taskAction.handlers', () => ({
  taskActionHandlers: {
    handleCreate: vi.fn(),
    handleUpdate: vi.fn(),
    handleDelete: vi.fn(),
  },
}));

vi.mock('@/shared/utils/response/response.utils', () => ({
  errorResponse: vi.fn(),
}));

const mockHandlers = vi.mocked(taskActionHandlers);
const mockErrorResponse = vi.mocked(errorResponse);

describe('taskAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HTTP method routing', () => {
    it('should route POST request to handleCreate', async () => {
      const request = createMockRequest(HTTP_METHODS.POST);
      const mockResponse = new Response('created', { status: 201 });
      mockHandlers.handleCreate.mockResolvedValue(mockResponse);

      const result = await taskAction(createMockActionArgs(request));

      expect(mockHandlers.handleCreate).toHaveBeenCalledWith(request);
      expect(mockHandlers.handleCreate).toHaveBeenCalledOnce();
      expect(result).toBe(mockResponse);
    });

    it('should route PUT request to handleUpdate', async () => {
      const request = createMockRequest(HTTP_METHODS.PUT);
      const mockResponse = new Response('updated', { status: 200 });
      mockHandlers.handleUpdate.mockResolvedValue(mockResponse);

      const result = await taskAction(createMockActionArgs(request));

      expect(mockHandlers.handleUpdate).toHaveBeenCalledWith(request);
      expect(mockHandlers.handleUpdate).toHaveBeenCalledOnce();
      expect(result).toBe(mockResponse);
    });

    it('should route DELETE request to handleDelete', async () => {
      const request = createMockRequest(HTTP_METHODS.DELETE);
      const mockResponse = new Response(null, { status: 204 });
      mockHandlers.handleDelete.mockResolvedValue(mockResponse);

      const result = await taskAction(createMockActionArgs(request));

      expect(mockHandlers.handleDelete).toHaveBeenCalledWith(request);
      expect(mockHandlers.handleDelete).toHaveBeenCalledOnce();
      expect(result).toBe(mockResponse);
    });

    it('should return error response for unsupported HTTP methods', async () => {
      const request = createMockRequest(HTTP_METHODS.GET);
      const errorRes = new Response('not allowed', { status: 405 });
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await taskAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Method not allowed', HTTP_STATUS.METHOD_NOT_ALLOWED);
      expect(result).toBe(errorRes);
    });
  });

  describe('error handling', () => {
    it('should return error response with error message when handler throws Error', async () => {
      const request = createMockRequest(HTTP_METHODS.POST);
      const errorRes = new Response('error', { status: 500 });
      mockHandlers.handleCreate.mockRejectedValue(new Error('Task creation failed'));
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await taskAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Task creation failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(result).toBe(errorRes);
    });

    it('should return generic error response when handler throws non-Error value', async () => {
      const request = createMockRequest(HTTP_METHODS.PUT);
      const errorRes = new Response('error', { status: 500 });
      mockHandlers.handleUpdate.mockRejectedValue(new Error('Failed to process request'));
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await taskAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to process request', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(result).toBe(errorRes);
    });
  });
});
