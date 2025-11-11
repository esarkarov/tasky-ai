import { HTTP_METHODS, HTTP_STATUS } from '@/shared/constants/http-methods';
import { errorResponse } from '@/shared/utils/response/response.utils';
import { ActionFunction } from 'react-router';
import { taskActionHandlers } from '@/features/tasks/services/taskAction.handlers';

export const taskAction: ActionFunction = async ({ request }) => {
  const method = request.method;

  try {
    switch (method) {
      case HTTP_METHODS.POST:
        return await taskActionHandlers.handleCreate(request);
      case HTTP_METHODS.PUT:
        return await taskActionHandlers.handleUpdate(request);
      case HTTP_METHODS.DELETE:
        return await taskActionHandlers.handleDelete(request);
      default:
        return errorResponse('Method not allowed', HTTP_STATUS.METHOD_NOT_ALLOWED);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return errorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
