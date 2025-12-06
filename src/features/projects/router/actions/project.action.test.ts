import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectAction } from './project.action';
import { projectActionHandlers } from '@/features/projects/services/projectAction.handlers';
import { errorResponse } from '@/shared/utils/response/response.utils';
import { createMockActionArgs, createMockRequest } from '@/core/test-setup/factories';
import { HTTP_METHODS, HTTP_STATUS } from '@/shared/constants';

vi.mock('@/features/projects/services/projectAction.handlers', () => ({
  projectActionHandlers: {
    handleCreate: vi.fn(),
    handleUpdate: vi.fn(),
    handleDelete: vi.fn(),
  },
}));

vi.mock('@/shared/utils/response/response.utils', () => ({
  errorResponse: vi.fn(),
}));

const mockHandlers = vi.mocked(projectActionHandlers);
const mockErrorResponse = vi.mocked(errorResponse);

describe('projectAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HTTP method routing', () => {
    it('should route POST request to handleCreate', async () => {
      const request = createMockRequest(HTTP_METHODS.POST);
      const mockResponse = new Response('created', { status: 201 });
      mockHandlers.handleCreate.mockResolvedValue(mockResponse);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockHandlers.handleCreate).toHaveBeenCalledWith(request);
      expect(mockHandlers.handleCreate).toHaveBeenCalledOnce();
      expect(result).toBe(mockResponse);
    });

    it('should route PUT request to handleUpdate', async () => {
      const request = createMockRequest(HTTP_METHODS.PUT);
      const mockResponse = new Response('updated', { status: 200 });
      mockHandlers.handleUpdate.mockResolvedValue(mockResponse);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockHandlers.handleUpdate).toHaveBeenCalledWith(request);
      expect(mockHandlers.handleUpdate).toHaveBeenCalledOnce();
      expect(result).toBe(mockResponse);
    });

    it('should route DELETE request to handleDelete', async () => {
      const request = createMockRequest(HTTP_METHODS.DELETE);
      const mockResponse = new Response(null, { status: 204 });
      mockHandlers.handleDelete.mockResolvedValue(mockResponse);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockHandlers.handleDelete).toHaveBeenCalledWith(request);
      expect(mockHandlers.handleDelete).toHaveBeenCalledOnce();
      expect(result).toBe(mockResponse);
    });

    it('should return error response for unsupported HTTP methods', async () => {
      const request = createMockRequest(HTTP_METHODS.GET);
      const errorRes = new Response('not allowed', { status: 405 });
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Method not allowed', HTTP_STATUS.METHOD_NOT_ALLOWED);
      expect(result).toBe(errorRes);
    });
  });

  describe('error handling', () => {
    it('should return error response with error message when handler throws Error', async () => {
      const request = createMockRequest(HTTP_METHODS.POST);
      const errorRes = new Response('error', { status: 500 });
      mockHandlers.handleCreate.mockRejectedValue(new Error('Database connection failed'));
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Database connection failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(result).toBe(errorRes);
    });

    it('should return generic error response when handler throws non-Error value', async () => {
      const request = createMockRequest(HTTP_METHODS.PUT);
      const errorRes = new Response('error', { status: 500 });
      mockHandlers.handleUpdate.mockRejectedValue(new Error('Failed to process request'));
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to process request', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(result).toBe(errorRes);
    });
  });
});
