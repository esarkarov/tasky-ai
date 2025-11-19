import type { ProjectFormInput } from '@/features/projects/types';
import { HTTP_METHODS } from '@/shared/constants/http';
import { ROUTES } from '@/shared/constants/routes';
import { NavigationState } from '@/shared/types';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectMutation } from './use-project-mutation';

const mockSubmit = vi.fn();
const mockToast = vi.fn();
const mockOnSuccess = vi.fn();

const mockFetcher = {
  submit: mockSubmit,
  state: 'idle' as NavigationState,
};

vi.mock('react-router', () => ({
  useFetcher: () => mockFetcher,
}));

vi.mock('@/shared/hooks/use-toast/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/shared/utils/operation/operation.utils', () => ({
  executeWithToast: vi.fn(async (operation, _toast, _toastContent, _description, onSuccess) => {
    await operation();
    if (onSuccess) {
      onSuccess();
    }
  }),
}));

describe('useProjectMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.state = 'idle';
  });

  describe('loading state', () => {
    it('should initialize with idle loading state', () => {
      const { result } = renderHook(() => useProjectMutation());

      expect(result.current.isLoading).toBe(false);
    });

    it('should show loading state when fetcher is not idle', () => {
      mockFetcher.state = 'submitting';
      const { result } = renderHook(() => useProjectMutation());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('createProject', () => {
    it('should create project without AI tasks', async () => {
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));

      const projectData: ProjectFormInput = {
        name: 'New Project',
        color_name: 'blue',
        color_hex: '#0000FF',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify(projectData), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.POST,
        encType: 'application/json',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should create project with AI-generated tasks', async () => {
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));

      const projectData: ProjectFormInput = {
        name: 'AI Project',
        color_name: 'green',
        color_hex: '#00FF00',
        ai_task_gen: true,
        task_gen_prompt: 'Generate tasks for a web app',
      };

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify(projectData), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.POST,
        encType: 'application/json',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(() => useProjectMutation());

      const projectData: ProjectFormInput = {
        name: 'Project',
        color_name: 'blue',
        color_hex: '#0000FF',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('should update project', async () => {
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));

      const projectData: ProjectFormInput = {
        id: 'project-123',
        name: 'Updated Project',
        color_name: 'red',
        color_hex: '#FF0000',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      await act(async () => {
        await result.current.updateProject(projectData);
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify(projectData), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.PUT,
        encType: 'application/json',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('should delete project', async () => {
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));

      const projectId = 'project-123';
      const projectName = 'Test Project';

      await act(async () => {
        await result.current.deleteProject(projectId, projectName);
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify({ id: projectId }), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.DELETE,
        encType: 'application/json',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe('multiple operations', () => {
    it('should handle multiple operations sequentially', async () => {
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));

      const createData: ProjectFormInput = {
        name: 'New Project',
        color_name: 'blue',
        color_hex: '#0000FF',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      const updateData: ProjectFormInput = {
        id: 'project-123',
        name: 'Updated Project',
        color_name: 'red',
        color_hex: '#FF0000',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      await act(async () => {
        await result.current.createProject(createData);
      });

      await act(async () => {
        await result.current.updateProject(updateData);
      });

      expect(mockSubmit).toHaveBeenCalledTimes(2);
      expect(mockOnSuccess).toHaveBeenCalledTimes(2);
    });
  });
});
