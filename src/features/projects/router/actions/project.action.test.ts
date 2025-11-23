import { projectActionHandlers } from '@/features/projects/services/projectAction.handlers';
import { HTTP_METHODS, HTTP_STATUS } from '@/shared/constants';
import { errorResponse } from '@/shared/utils/response/response.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectAction } from './project.action';
import { createMockActionArgs, createMockRequest } from '@/core/test-setup/factories';

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('projectAction', () => {
  describe('HTTP method handling', () => {
    it('calls handleCreate when method is POST', async () => {
      const request = createMockRequest(HTTP_METHODS.POST);
      const mockResponse = new Response('created', { status: 201 });
      mockHandlers.handleCreate.mockResolvedValue(mockResponse);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockHandlers.handleCreate).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('calls handleUpdate when method is PUT', async () => {
      const request = createMockRequest(HTTP_METHODS.PUT);
      const mockResponse = new Response('updated', { status: 200 });
      mockHandlers.handleUpdate.mockResolvedValue(mockResponse);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockHandlers.handleUpdate).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('calls handleDelete when method is DELETE', async () => {
      const request = createMockRequest(HTTP_METHODS.DELETE);
      const mockResponse = new Response(null, { status: 204 });
      mockHandlers.handleDelete.mockResolvedValue(mockResponse);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockHandlers.handleDelete).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('returns errorResponse when method is unsupported', async () => {
      const request = createMockRequest(HTTP_METHODS.GET);
      const errorRes = new Response('not allowed', { status: 405 });
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Method not allowed', HTTP_STATUS.METHOD_NOT_ALLOWED);
      expect(result).toBe(errorRes);
    });
  });

  describe('error handling', () => {
    it('returns errorResponse when handler throws an Error instance', async () => {
      const request = createMockRequest(HTTP_METHODS.POST);
      const thrownError = new Error('Handler failed');
      const errorRes = new Response('error', { status: 500 });
      mockHandlers.handleCreate.mockRejectedValue(thrownError);
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Handler failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(result).toBe(errorRes);
    });

    it('returns generic errorResponse when thrown error is not an Error instance', async () => {
      const request = createMockRequest(HTTP_METHODS.PUT);
      const errorRes = new Response('error', { status: 500 });
      mockHandlers.handleUpdate.mockRejectedValue('Unknown error');
      mockErrorResponse.mockReturnValue(errorRes);

      const result = await projectAction(createMockActionArgs(request));

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to process request', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(result).toBe(errorRes);
    });
  });
});
