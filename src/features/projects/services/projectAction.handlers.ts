import { aiService } from '@/features/ai/services/ai.service';
import type { ProjectFormInput } from '@/features/projects/types';
import { taskService } from '@/features/tasks/services/task.service';
import { HTTP_STATUS, ROUTES } from '@/shared/constants';
import { errorResponse, successResponse } from '@/shared/utils/response/response.utils';
import { redirect } from 'react-router';
import { projectService } from './project.service';

export const projectActionHandlers = {
  async handleCreate(request: Request) {
    const data = (await request.json()) as ProjectFormInput;

    if (!data.name?.trim()) {
      return errorResponse('Project name is required', HTTP_STATUS.BAD_REQUEST);
    }

    const project = await projectService.create(data);

    if (data.ai_task_gen && data.task_gen_prompt?.trim()) {
      try {
        const aiTasks = await aiService.generateProjectTasks(data.task_gen_prompt);

        if (aiTasks.length > 0) {
          await taskService.createMany(project.$id, aiTasks);
        }
      } catch (error) {
        console.error('Failed to generate AI tasks:', error);
      }
    }

    return redirect(ROUTES.PROJECT(project.$id));
  },
  async handleUpdate(request: Request) {
    const data = (await request.json()) as ProjectFormInput;

    if (!data.id) {
      return errorResponse('Project ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { id, ...updateData } = data;
    const project = await projectService.update(id, updateData);

    return successResponse('Project updated successfully', { project });
  },
  async handleDelete(request: Request) {
    const data = (await request.json()) as { id: string };

    if (!data.id) {
      return errorResponse('Project ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    await projectService.delete(data.id);

    return successResponse('Project deleted successfully');
  },
};
