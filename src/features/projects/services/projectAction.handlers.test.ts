import { createMockProject } from '@/core/tests/factories';
import { aiService } from '@/features/ai/services/ai.service';
import type { ProjectFormInput } from '@/features/projects/types';
import { taskService } from '@/features/tasks/services/task.service';
import { HTTP_STATUS, ROUTES } from '@/shared/constants';
import { errorResponse, successResponse } from '@/shared/utils/response/response.utils';
import { redirect } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectService } from './project.service';
import { projectActionHandlers } from './projectAction.handlers';

vi.mock('./project.service', () => ({
  projectService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/features/ai/services/ai.service', () => ({
  aiService: {
    generateProjectTasks: vi.fn(),
  },
}));

vi.mock('@/features/tasks/services/task.service', () => ({
  taskService: {
    createMany: vi.fn(),
  },
}));

vi.mock('@/shared/utils/response/response.utils', () => ({
  errorResponse: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock('react-router', () => ({
  redirect: vi.fn(),
}));

const mockProjectService = vi.mocked(projectService);
const mockAiService = vi.mocked(aiService);
const mockTaskService = vi.mocked(taskService);
const mockErrorResponse = vi.mocked(errorResponse);
const mockSuccessResponse = vi.mocked(successResponse);
const mockRedirect = vi.mocked(redirect);

const createMockRequest = (body: object) =>
  new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('projectActionHandlers', () => {
  describe('handleCreate', () => {
    it('returns error when name is missing or blank', async () => {
      const invalidData = { name: '   ' } as ProjectFormInput;
      const request = createMockRequest(invalidData);

      await projectActionHandlers.handleCreate(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Project name is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockProjectService.create).not.toHaveBeenCalled();
    });

    it('creates project and redirects to its route', async () => {
      const mockProject = createMockProject();
      const validData = { name: 'Test Project', ai_task_gen: false, task_gen_prompt: '' } as ProjectFormInput;
      const request = createMockRequest(validData);

      mockProjectService.create.mockResolvedValue(mockProject);

      await projectActionHandlers.handleCreate(request);

      expect(mockProjectService.create).toHaveBeenCalledWith(validData);
      expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT('project-1'));
    });

    it('generates AI tasks when ai_task_gen is true and prompt provided', async () => {
      const mockProject = createMockProject();
      const aiTasks = [{ content: 'AI task 1' }];
      const data = {
        name: 'AI Project',
        ai_task_gen: true,
        task_gen_prompt: 'Generate tasks',
      } as ProjectFormInput;

      const request = createMockRequest(data);

      mockProjectService.create.mockResolvedValue(mockProject);
      mockAiService.generateProjectTasks.mockResolvedValue(aiTasks);

      await projectActionHandlers.handleCreate(request);

      expect(mockAiService.generateProjectTasks).toHaveBeenCalledWith('Generate tasks');
      expect(mockTaskService.createMany).toHaveBeenCalledWith('project-1', aiTasks);
      expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT('project-1'));
    });

    it('does not create tasks when AI returns empty list', async () => {
      const mockProject = createMockProject();
      const data = {
        name: 'Empty AI Project',
        ai_task_gen: true,
        task_gen_prompt: 'Empty result',
      } as ProjectFormInput;

      const request = createMockRequest(data);

      mockProjectService.create.mockResolvedValue(mockProject);
      mockAiService.generateProjectTasks.mockResolvedValue([]);

      await projectActionHandlers.handleCreate(request);

      expect(mockTaskService.createMany).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT('project-1'));
    });

    it('handles AI task generation errors gracefully', async () => {
      const mockProject = createMockProject();
      const data = {
        name: 'Error AI Project',
        ai_task_gen: true,
        task_gen_prompt: 'Error prompt',
      } as ProjectFormInput;
      const request = createMockRequest(data);

      mockProjectService.create.mockResolvedValue(mockProject);
      mockAiService.generateProjectTasks.mockRejectedValue(new Error('AI service failed'));

      await projectActionHandlers.handleCreate(request);

      expect(mockTaskService.createMany).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT('project-1'));
    });
  });

  describe('handleUpdate', () => {
    it('returns error if project ID is missing', async () => {
      const invalidData = { name: 'Project without ID' } as ProjectFormInput;
      const request = createMockRequest(invalidData);

      await projectActionHandlers.handleUpdate(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Project ID is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockProjectService.update).not.toHaveBeenCalled();
    });

    it('updates project and returns success response', async () => {
      const mockProject = createMockProject();
      const data = { id: '101', name: 'Updated Project' } as ProjectFormInput;
      const request = createMockRequest(data);

      mockProjectService.update.mockResolvedValue(mockProject);

      await projectActionHandlers.handleUpdate(request);

      expect(mockProjectService.update).toHaveBeenCalledWith('101', { name: 'Updated Project' });
      expect(mockSuccessResponse).toHaveBeenCalledWith('Project updated successfully', { project: mockProject });
    });
  });

  describe('handleDelete', () => {
    it('returns error if ID is missing', async () => {
      const request = createMockRequest({});
      await projectActionHandlers.handleDelete(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Project ID is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockProjectService.delete).not.toHaveBeenCalled();
    });

    it('deletes project and returns success response', async () => {
      const request = createMockRequest({ id: '321' });

      await projectActionHandlers.handleDelete(request);

      expect(mockProjectService.delete).toHaveBeenCalledWith('321');
      expect(mockSuccessResponse).toHaveBeenCalledWith('Project deleted successfully');
    });
  });
});
