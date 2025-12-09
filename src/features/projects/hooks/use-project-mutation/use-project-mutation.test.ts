import { useProjectMutation } from '@/features/projects/hooks/use-project-mutation/use-project-mutation';
import type { ProjectFormInput } from '@/features/projects/types';
import { HTTP_METHODS, ROUTES } from '@/shared/constants';
import { act, renderHook } from '@testing-library/react';
import type { Fetcher } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSubmit = vi.fn();
const mockToast = vi.fn();
const mockExecuteWithToast = vi.fn();
const mockFetcherState = { current: 'idle' as Fetcher['state'] };

vi.mock('react-router', () => ({
  useFetcher: () => ({
    submit: mockSubmit,
    state: mockFetcherState.current,
  }),
}));

vi.mock('@/shared/hooks/use-toast/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/shared/utils/operation/operation.utils', () => ({
  executeWithToast: vi.fn((...args: Parameters<typeof mockExecuteWithToast>) => mockExecuteWithToast(...args)),
}));

describe('useProjectMutation', () => {
  const createProjectData = (overrides?: Partial<ProjectFormInput>): ProjectFormInput => ({
    name: 'Test Project',
    color_name: 'blue',
    color_hex: '#0000FF',
    ai_task_gen: false,
    task_gen_prompt: '',
    ...overrides,
  });

  const expectedSubmitConfig = {
    action: ROUTES.PROJECTS,
    encType: 'application/json',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcherState.current = 'idle';
    mockExecuteWithToast.mockImplementation(async (operation, _toast, _content, _desc, onSuccess) => {
      await operation();
      if (onSuccess) onSuccess();
    });
  });

  describe('initialization', () => {
    it('should initialize with loading state as false', () => {
      const { result } = renderHook(() => useProjectMutation());

      expect(result.current.isLoading).toBe(false);
    });

    it('should expose createProject method', () => {
      const { result } = renderHook(() => useProjectMutation());

      expect(typeof result.current.createProject).toBe('function');
    });

    it('should expose updateProject method', () => {
      const { result } = renderHook(() => useProjectMutation());

      expect(typeof result.current.updateProject).toBe('function');
    });

    it('should expose deleteProject method', () => {
      const { result } = renderHook(() => useProjectMutation());

      expect(typeof result.current.deleteProject).toBe('function');
    });
  });

  describe('isLoading state', () => {
    it('should return false when fetcher state is idle', () => {
      mockFetcherState.current = 'idle';
      const { result } = renderHook(() => useProjectMutation());

      expect(result.current.isLoading).toBe(false);
    });

    it('should return true when fetcher state is loading', () => {
      mockFetcherState.current = 'loading';
      const { result } = renderHook(() => useProjectMutation());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return true when fetcher state is submitting', () => {
      mockFetcherState.current = 'submitting';
      const { result } = renderHook(() => useProjectMutation());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('createProject', () => {
    it('should submit project creation with correct payload', async () => {
      const { result } = renderHook(() => useProjectMutation());
      const projectData = createProjectData({ name: 'New Project' });

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify(projectData), {
        ...expectedSubmitConfig,
        method: HTTP_METHODS.POST,
      });
    });

    it('should call executeWithToast with correct parameters for project without AI', async () => {
      const { result } = renderHook(() => useProjectMutation());
      const projectData = createProjectData({ name: 'Regular Project' });

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.objectContaining({
          success: 'Project created!',
        }),
        'Project "Regular Project" created successfully',
        undefined
      );
    });

    it('should use AI description when ai_task_gen is true', async () => {
      const { result } = renderHook(() => useProjectMutation());
      const projectData = createProjectData({
        name: 'AI Project',
        ai_task_gen: true,
        task_gen_prompt: 'Generate tasks',
      });

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        'Project "AI Project" created with AI-generated tasks',
        undefined
      );
    });

    it('should pass onSuccess callback to executeWithToast', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));
      const projectData = createProjectData();

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        expect.any(String),
        mockOnSuccess
      );
    });

    it('should invoke onSuccess callback after successful creation', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));
      const projectData = createProjectData();

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(() => useProjectMutation());
      const projectData = createProjectData();

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(mockSubmit).toHaveBeenCalled();
      expect(mockExecuteWithToast).toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('should submit project update with correct payload', async () => {
      const { result } = renderHook(() => useProjectMutation());
      const projectData = createProjectData({
        id: 'project-123',
        name: 'Updated Project',
      });

      await act(async () => {
        await result.current.updateProject(projectData);
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify(projectData), {
        ...expectedSubmitConfig,
        method: HTTP_METHODS.PUT,
      });
    });

    it('should call executeWithToast with correct parameters', async () => {
      const { result } = renderHook(() => useProjectMutation());
      const projectData = createProjectData({
        id: 'project-123',
        name: 'Updated Project',
      });

      await act(async () => {
        await result.current.updateProject(projectData);
      });

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.objectContaining({
          success: 'Project updated!',
        }),
        'Project "Updated Project" updated successfully',
        undefined
      );
    });

    it('should pass onSuccess callback to executeWithToast', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));
      const projectData = createProjectData({ id: 'project-123' });

      await act(async () => {
        await result.current.updateProject(projectData);
      });

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        expect.any(String),
        mockOnSuccess
      );
    });

    it('should invoke onSuccess callback after successful update', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));
      const projectData = createProjectData({ id: 'project-123' });

      await act(async () => {
        await result.current.updateProject(projectData);
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteProject', () => {
    it('should submit project deletion with correct payload', async () => {
      const { result } = renderHook(() => useProjectMutation());

      await act(async () => {
        await result.current.deleteProject('project-123', 'Test Project');
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify({ id: 'project-123' }), {
        ...expectedSubmitConfig,
        method: HTTP_METHODS.DELETE,
      });
    });

    it('should call executeWithToast with correct parameters', async () => {
      const { result } = renderHook(() => useProjectMutation());

      await act(async () => {
        await result.current.deleteProject('project-123', 'Test Project');
      });

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.objectContaining({
          success: 'Project deleted!',
        }),
        'Project "Test Project" deleted successfully',
        undefined
      );
    });

    it('should pass onSuccess callback to executeWithToast', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.deleteProject('project-123', 'Test Project');
      });

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        expect.any(String),
        mockOnSuccess
      );
    });

    it('should invoke onSuccess callback after successful deletion', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.deleteProject('project-123', 'Test Project');
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('multiple operations', () => {
    it('should handle sequential create and update operations', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectMutation({ onSuccess: mockOnSuccess }));

      const createData = createProjectData({ name: 'New Project' });
      const updateData = createProjectData({
        id: 'project-123',
        name: 'Updated Project',
      });

      await act(async () => {
        await result.current.createProject(createData);
      });

      await act(async () => {
        await result.current.updateProject(updateData);
      });

      expect(mockSubmit).toHaveBeenCalledTimes(2);
      expect(mockOnSuccess).toHaveBeenCalledTimes(2);
    });

    it('should call correct methods for each operation', async () => {
      const { result } = renderHook(() => useProjectMutation());

      const createData = createProjectData();
      const updateData = createProjectData({ id: 'project-123' });

      await act(async () => {
        await result.current.createProject(createData);
      });

      expect(mockSubmit).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: HTTP_METHODS.POST })
      );

      await act(async () => {
        await result.current.updateProject(updateData);
      });

      expect(mockSubmit).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: HTTP_METHODS.PUT })
      );
    });
  });

  describe('hook API', () => {
    it('should expose all required methods', () => {
      const { result } = renderHook(() => useProjectMutation());

      expect(typeof result.current.createProject).toBe('function');
      expect(typeof result.current.updateProject).toBe('function');
      expect(typeof result.current.deleteProject).toBe('function');
    });

    it('should expose isLoading property', () => {
      const { result } = renderHook(() => useProjectMutation());

      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
