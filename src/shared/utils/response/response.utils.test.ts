import { HTTP_STATUS } from '@/shared/constants/http';
import { HttpStatusCode } from '@/shared/types';
import { errorResponse, jsonResponse, successResponse } from '@/shared/utils/response/response.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubGlobal('Response', vi.fn());

const mockedResponse = vi.mocked(Response);

describe('response utils', () => {
  const JSON_HEADERS = { 'Content-Type': 'application/json' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const expectResponseCalledWith = (data: unknown, status: HttpStatusCode) => {
    expect(mockedResponse).toHaveBeenCalledWith(JSON.stringify(data), {
      status,
      headers: JSON_HEADERS,
    });
  };

  describe('jsonResponse', () => {
    const mockResponses = [
      {
        description: 'object data',
        data: { message: 'test' },
        status: HTTP_STATUS.OK,
      },
      {
        description: 'array data',
        data: [1, 2, 3],
        status: HTTP_STATUS.CREATED,
      },
      {
        description: 'null data',
        data: null,
        status: HTTP_STATUS.NO_CONTENT,
      },
    ];

    it.each(mockResponses)('should create response with $description and status code', ({ data, status }) => {
      jsonResponse(data, status);

      expectResponseCalledWith(data, status);
    });
  });

  describe('errorResponse', () => {
    const mockHttpErrors = [
      { message: 'Not found', status: HTTP_STATUS.NOT_FOUND },
      { message: 'Internal server error', status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
      { message: 'Bad request', status: HTTP_STATUS.BAD_REQUEST },
    ];

    it.each(mockHttpErrors)(
      'should create error response with message "$message" and status $status',
      ({ message, status }) => {
        const expectedData = { success: false, message };

        errorResponse(message, status);

        expectResponseCalledWith(expectedData, status);
      }
    );
  });

  describe('successResponse', () => {
    describe('with message only', () => {
      it('should create response with default status', () => {
        const message = 'Operation successful';
        const expectedData = { success: true, message };

        successResponse(message);

        expectResponseCalledWith(expectedData, HTTP_STATUS.OK);
      });
    });

    describe('with message and data', () => {
      it('should merge data into response with default status', () => {
        const message = 'Success with data';
        const data = { id: 123, name: 'admin' };
        const expectedData = { success: true, message, ...data };

        successResponse(message, data);

        expectResponseCalledWith(expectedData, HTTP_STATUS.OK);
      });

      it('should merge data into response with custom status', () => {
        const message = 'Data retrieved';
        const data = { items: [1, 2, 3], total: 3 };
        const status = 201;
        const expectedData = { success: true, message, ...data };

        successResponse(message, data, status);

        expectResponseCalledWith(expectedData, status);
      });
    });
  });
});
