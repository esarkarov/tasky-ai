import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskAction } from './task.action';
import { HTTP_METHODS, HTTP_STATUS } from '@/shared/constants/http';
import { errorResponse } from '@/shared/utils/response/response.utils';
import { taskActionHandlers } from '@/features/tasks/services/taskAction.handlers';

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

const createRequest = (method: string) => new Request('http://localhost', { method });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('taskAction', () => {
  describe('HTTP method handling', () => {
    it('calls handleCreate for POST requests', async () => {
      const request = createRequest(HTTP_METHODS.POST);
      const mockResponse = new Response('created', { status: 201 });
      mockHandlers.handleCreate.mockResolvedValue(mockResponse);

      const result = await taskAction({ request, params: {}, context: {} });

      expect(mockHandlers.handleCreate).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('calls handleUpdate for PUT requests', async () => {
      const request = createRequest(HTTP_METHODS.PUT);
      const mockResponse = new Response('updated', { status: 200 });
      mockHandlers.handleUpdate.mockResolvedValue(mockResponse);

      const result = await taskAction({ request, params: {}, context: {} });

      expect(mockHandlers.handleUpdate).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('calls handleDelete for DELETE requests', async () => {
      const request = createRequest(HTTP_METHODS.DELETE);
      const mockResponse = new Response(null, { status: 204 });
      mockHandlers.handleDelete.mockResolvedValue(mockResponse);

      const result = await taskAction({ request, params: {}, context: {} });

      expect(mockHandlers.handleDelete).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('returns errorResponse for unsupported methods', async () => {
      const request = createRequest(HTTP_METHODS.GET);
      const errorRes = new Response('not allowed', { status: 405 });
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await taskAction({ request, params: {}, context: {} });

      expect(mockErrorResponse).toHaveBeenCalledWith('Method not allowed', HTTP_STATUS.METHOD_NOT_ALLOWED);
      expect(result).toBe(errorRes);
    });
  });

  describe('error handling', () => {
    it('returns internal server error when handler throws Error instance', async () => {
      const request = createRequest(HTTP_METHODS.POST);
      const thrownError = new Error('Service failed');
      mockHandlers.handleCreate.mockRejectedValue(thrownError);
      const errorRes = new Response('error', { status: 500 });
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await taskAction({ request, params: {}, context: {} });

      expect(mockErrorResponse).toHaveBeenCalledWith('Service failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(result).toBe(errorRes);
    });

    it('returns internal server error when unknown error is thrown', async () => {
      const request = createRequest(HTTP_METHODS.PUT);
      mockHandlers.handleUpdate.mockRejectedValue('Unexpected failure');
      const errorRes = new Response('error', { status: 500 });
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await taskAction({ request, params: {}, context: {} });

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to process request', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(result).toBe(errorRes);
    });
  });
});
