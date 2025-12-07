import { HTTP_STATUS } from '@/shared/constants';
import { errorResponse, jsonResponse, successResponse } from '@/shared/utils/response/response.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubGlobal('Response', vi.fn());

const mockResponse = vi.mocked(Response);

describe('response utils', () => {
  const JSON_HEADERS = { 'Content-Type': 'application/json' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('jsonResponse', () => {
    it('should create Response with JSON stringified data', () => {
      const data = { message: 'test', count: 42 };
      const status = HTTP_STATUS.OK;

      jsonResponse(data, status);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify(data), {
        status,
        headers: JSON_HEADERS,
      });
      expect(mockResponse).toHaveBeenCalledOnce();
    });

    it('should create Response with array data', () => {
      const data = [1, 2, 3, 4, 5];
      const status = HTTP_STATUS.CREATED;

      jsonResponse(data, status);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify(data), {
        status,
        headers: JSON_HEADERS,
      });
      expect(mockResponse).toHaveBeenCalledOnce();
    });

    it('should create Response with null data', () => {
      const data = null;
      const status = HTTP_STATUS.NO_CONTENT;

      jsonResponse(data, status);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify(data), {
        status,
        headers: JSON_HEADERS,
      });
      expect(mockResponse).toHaveBeenCalledOnce();
    });

    it('should set correct Content-Type header', () => {
      const data = { test: 'data' };
      const status = HTTP_STATUS.OK;

      jsonResponse(data, status);

      expect(mockResponse).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  describe('errorResponse', () => {
    it('should create error response with success false', () => {
      const message = 'Resource not found';
      const status = HTTP_STATUS.NOT_FOUND;

      errorResponse(message, status);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify({ success: false, message }), {
        status,
        headers: JSON_HEADERS,
      });
      expect(mockResponse).toHaveBeenCalledOnce();
    });

    it('should create error response with custom message', () => {
      const message = 'Internal server error occurred';
      const status = HTTP_STATUS.INTERNAL_SERVER_ERROR;

      errorResponse(message, status);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify({ success: false, message }), {
        status,
        headers: JSON_HEADERS,
      });
    });

    it('should create error response with bad request status', () => {
      const message = 'Invalid request parameters';
      const status = HTTP_STATUS.BAD_REQUEST;

      errorResponse(message, status);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify({ success: false, message }), {
        status,
        headers: JSON_HEADERS,
      });
    });
  });

  describe('successResponse', () => {
    it('should create success response with message only', () => {
      const message = 'Operation completed successfully';

      successResponse(message);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify({ success: true, message }), {
        status: HTTP_STATUS.OK,
        headers: JSON_HEADERS,
      });
      expect(mockResponse).toHaveBeenCalledOnce();
    });

    it('should use default status 200 when not provided', () => {
      const message = 'Success';

      successResponse(message);

      expect(mockResponse).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ status: HTTP_STATUS.OK })
      );
    });

    it('should merge additional data into response', () => {
      const message = 'User created successfully';
      const data = { id: 123, username: 'testuser' };

      successResponse(message, data);

      expect(mockResponse).toHaveBeenCalledWith(
        JSON.stringify({ success: true, message, id: 123, username: 'testuser' }),
        {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS,
        }
      );
    });

    it('should use custom status when provided with data', () => {
      const message = 'Resource created';
      const data = { resourceId: 456 };
      const status = HTTP_STATUS.CREATED;

      successResponse(message, data, status);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify({ success: true, message, resourceId: 456 }), {
        status,
        headers: JSON_HEADERS,
      });
    });

    it('should handle empty data object', () => {
      const message = 'Task completed';
      const data = {};

      successResponse(message, data);

      expect(mockResponse).toHaveBeenCalledWith(JSON.stringify({ success: true, message }), {
        status: HTTP_STATUS.OK,
        headers: JSON_HEADERS,
      });
    });
  });
});
