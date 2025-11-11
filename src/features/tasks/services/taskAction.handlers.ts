import { taskService } from './task.service';
import type { TaskFormInput } from '../types';
import { errorResponse, successResponse } from '@/shared/utils/response/response.utils';
import { HTTP_STATUS } from '@/shared/constants/http-methods';

export const taskActionHandlers = {
  async handleCreate(request: Request) {
    const data = (await request.json()) as TaskFormInput;

    if (!data.content?.trim()) {
      return errorResponse('Task content is required', HTTP_STATUS.BAD_REQUEST);
    }

    const task = await taskService.create(data);

    return successResponse('Task created successfully', { task }, HTTP_STATUS.CREATED);
  },
  async handleUpdate(request: Request) {
    const data = (await request.json()) as TaskFormInput;

    if (!data.id) {
      return errorResponse('Task ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { id, ...updateData } = data;
    const task = await taskService.update(id, updateData);

    return successResponse('Task updated successfully', { task });
  },
  async handleDelete(request: Request) {
    const data = (await request.json()) as { id: string };

    if (!data.id) {
      return errorResponse('Task ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    await taskService.delete(data.id);

    return successResponse('Task deleted successfully');
  },
};
