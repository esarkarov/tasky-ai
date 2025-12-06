import { createMockProject } from '@/core/test-setup/factories';
import { aiService } from '@/features/ai/services/ai.service';
import { projectService } from '@/features/projects/services/project.service';
import { projectActionHandlers } from '@/features/projects/services/projectAction.handlers';
import type { ProjectFormInput } from '@/features/projects/types';
import { taskService } from '@/features/tasks/services/task.service';
import { HTTP_STATUS, ROUTES } from '@/shared/constants';
import { errorResponse, successResponse } from '@/shared/utils/response/response.utils';
import { redirect } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('projectActionHandlers', () => {
  const createMockRequest = (body: Partial<ProjectFormInput> | { id?: string }) =>
    new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleCreate', () => {
    describe('validation', () => {
      it('should return error when project name is empty', async () => {
        const invalidData: Partial<ProjectFormInput> = { name: '' };
        const request = createMockRequest(invalidData);

        await projectActionHandlers.handleCreate(request);

        expect(mockErrorResponse).toHaveBeenCalledWith('Project name is required', HTTP_STATUS.BAD_REQUEST);
        expect(mockProjectService.create).not.toHaveBeenCalled();
      });

      it('should return error when project name is only whitespace', async () => {
        const invalidData: Partial<ProjectFormInput> = { name: '   ' };
        const request = createMockRequest(invalidData);

        await projectActionHandlers.handleCreate(request);

        expect(mockErrorResponse).toHaveBeenCalledWith('Project name is required', HTTP_STATUS.BAD_REQUEST);
        expect(mockProjectService.create).not.toHaveBeenCalled();
      });
    });

    describe('basic project creation', () => {
      it('should create project and redirect to project page', async () => {
        const mockProject = createMockProject();
        const validData: Partial<ProjectFormInput> = {
          name: 'Test Project',
          ai_task_gen: false,
          task_gen_prompt: '',
        };
        const request = createMockRequest(validData);
        mockProjectService.create.mockResolvedValue(mockProject);

        await projectActionHandlers.handleCreate(request);

        expect(mockProjectService.create).toHaveBeenCalledWith(validData);
        expect(mockProjectService.create).toHaveBeenCalledOnce();
        expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT(mockProject.$id));
        expect(mockRedirect).toHaveBeenCalledOnce();
      });
    });

    describe('AI task generation', () => {
      it('should generate and create AI tasks when ai_task_gen is enabled', async () => {
        const mockProject = createMockProject();
        const aiTasks = [{ content: 'AI generated task', title: 'Task 1' }];
        const data: Partial<ProjectFormInput> = {
          name: 'AI Project',
          ai_task_gen: true,
          task_gen_prompt: 'Generate project tasks',
        };
        const request = createMockRequest(data);
        mockProjectService.create.mockResolvedValue(mockProject);
        mockAiService.generateProjectTasks.mockResolvedValue(aiTasks);

        await projectActionHandlers.handleCreate(request);

        expect(mockAiService.generateProjectTasks).toHaveBeenCalledWith('Generate project tasks');
        expect(mockAiService.generateProjectTasks).toHaveBeenCalledOnce();
        expect(mockTaskService.createMany).toHaveBeenCalledWith(mockProject.$id, aiTasks);
        expect(mockTaskService.createMany).toHaveBeenCalledOnce();
        expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT(mockProject.$id));
      });

      it('should not create tasks when AI returns empty array', async () => {
        const mockProject = createMockProject();
        const data: Partial<ProjectFormInput> = {
          name: 'Empty AI Project',
          ai_task_gen: true,
          task_gen_prompt: 'Generate nothing',
        };
        const request = createMockRequest(data);
        mockProjectService.create.mockResolvedValue(mockProject);
        mockAiService.generateProjectTasks.mockResolvedValue([]);

        await projectActionHandlers.handleCreate(request);

        expect(mockAiService.generateProjectTasks).toHaveBeenCalledOnce();
        expect(mockTaskService.createMany).not.toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT(mockProject.$id));
      });

      it('should skip AI generation when ai_task_gen is false', async () => {
        const mockProject = createMockProject();
        const data: Partial<ProjectFormInput> = {
          name: 'Manual Project',
          ai_task_gen: false,
          task_gen_prompt: 'This should be ignored',
        };
        const request = createMockRequest(data);
        mockProjectService.create.mockResolvedValue(mockProject);

        await projectActionHandlers.handleCreate(request);

        expect(mockAiService.generateProjectTasks).not.toHaveBeenCalled();
        expect(mockTaskService.createMany).not.toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT(mockProject.$id));
      });

      it('should skip AI generation when prompt is empty', async () => {
        const mockProject = createMockProject();
        const data: Partial<ProjectFormInput> = {
          name: 'Project with empty prompt',
          ai_task_gen: true,
          task_gen_prompt: '',
        };
        const request = createMockRequest(data);
        mockProjectService.create.mockResolvedValue(mockProject);

        await projectActionHandlers.handleCreate(request);

        expect(mockAiService.generateProjectTasks).not.toHaveBeenCalled();
        expect(mockTaskService.createMany).not.toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT(mockProject.$id));
      });

      it('should continue with redirect when AI task generation fails', async () => {
        const mockProject = createMockProject();
        const data: Partial<ProjectFormInput> = {
          name: 'Error Project',
          ai_task_gen: true,
          task_gen_prompt: 'Generate tasks',
        };
        const request = createMockRequest(data);
        mockProjectService.create.mockResolvedValue(mockProject);
        mockAiService.generateProjectTasks.mockRejectedValue(new Error('AI service unavailable'));

        await projectActionHandlers.handleCreate(request);

        expect(mockAiService.generateProjectTasks).toHaveBeenCalledOnce();
        expect(mockTaskService.createMany).not.toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PROJECT(mockProject.$id));
      });
    });
  });

  describe('handleUpdate', () => {
    it('should return error when project ID is missing', async () => {
      const invalidData: Partial<ProjectFormInput> = { name: 'Project without ID' };
      const request = createMockRequest(invalidData);

      await projectActionHandlers.handleUpdate(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Project ID is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockProjectService.update).not.toHaveBeenCalled();
    });

    it('should update project and return success response', async () => {
      const mockProject = createMockProject();
      const data: Partial<ProjectFormInput> = {
        id: 'project-123',
        name: 'Updated Project Name',
        color_name: 'red',
        color_hex: '#FF0000',
      };
      const request = createMockRequest(data);
      mockProjectService.update.mockResolvedValue(mockProject);

      await projectActionHandlers.handleUpdate(request);

      expect(mockProjectService.update).toHaveBeenCalledWith('project-123', {
        name: 'Updated Project Name',
        color_name: 'red',
        color_hex: '#FF0000',
      });
      expect(mockProjectService.update).toHaveBeenCalledOnce();
      expect(mockSuccessResponse).toHaveBeenCalledWith('Project updated successfully', { project: mockProject });
      expect(mockSuccessResponse).toHaveBeenCalledOnce();
    });
  });

  describe('handleDelete', () => {
    it('should return error when project ID is missing', async () => {
      const request = createMockRequest({});

      await projectActionHandlers.handleDelete(request);

      expect(mockErrorResponse).toHaveBeenCalledWith('Project ID is required', HTTP_STATUS.BAD_REQUEST);
      expect(mockProjectService.delete).not.toHaveBeenCalled();
    });

    it('should delete project and return success response', async () => {
      const request = createMockRequest({ id: 'project-456' });

      await projectActionHandlers.handleDelete(request);

      expect(mockProjectService.delete).toHaveBeenCalledWith('project-456');
      expect(mockProjectService.delete).toHaveBeenCalledOnce();
      expect(mockSuccessResponse).toHaveBeenCalledWith('Project deleted successfully');
      expect(mockSuccessResponse).toHaveBeenCalledOnce();
    });
  });
});
