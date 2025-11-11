import { HTTP_METHODS, HTTP_STATUS } from '@/shared/constants/http-methods';
import { errorResponse } from '@/shared/utils/response/response.utils';
import type { ActionFunction } from 'react-router';
import { projectActionHandlers } from '@/features/projects/services/projectAction.handlers';

export const projectAction: ActionFunction = async ({ request }) => {
  const method = request.method;

  try {
    switch (method) {
      case HTTP_METHODS.POST:
        return await projectActionHandlers.handleCreate(request);
      case HTTP_METHODS.PUT:
        return await projectActionHandlers.handleUpdate(request);
      case HTTP_METHODS.DELETE:
        return await projectActionHandlers.handleDelete(request);
      default:
        return errorResponse('Method not allowed', HTTP_STATUS.METHOD_NOT_ALLOWED);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return errorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
