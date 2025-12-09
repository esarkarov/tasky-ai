import type { ProjectFormInput } from '@/features/projects/types';
import { ROUTES } from '@/shared/constants';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectMutation } from '../use-project-mutation/use-project-mutation';
import { useProjectModal } from './use-project-modal';

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockLocationState.current }),
}));

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => ({ close: mockCancelModal }),
}));

vi.mock('../use-project-mutation/use-project-mutation');

const mockNavigate = vi.fn();
const mockCancelModal = vi.fn();
const mockCreateProject = vi.fn();
const mockUpdateProject = vi.fn();
const mockDeleteProject = vi.fn();
const mockLocationState = { current: '/app/projects' };
const mockUseProjectMutation = vi.mocked(useProjectMutation);

describe('useProjectModal', () => {
  const createProjectData = (overrides?: Partial<ProjectFormInput>): ProjectFormInput => ({
    name: 'Test Project',
    color_name: 'blue',
    color_hex: '#0000FF',
    ai_task_gen: false,
    task_gen_prompt: '',
    ...overrides,
  });

  const setupMutation = (isLoading = false) => {
    let onSuccessCallback: (() => void) | undefined;

    mockUseProjectMutation.mockImplementation((params = {}) => {
      onSuccessCallback = params.onSuccess;
      return {
        createProject: vi.fn(async (data: ProjectFormInput) => {
          mockCreateProject(data);
          if (onSuccessCallback) await onSuccessCallback();
        }),
        updateProject: vi.fn(async (data: ProjectFormInput) => {
          mockUpdateProject(data);
          if (onSuccessCallback) await onSuccessCallback();
        }),
        deleteProject: vi.fn(async (id: string, name: string) => {
          mockDeleteProject(id, name);
          if (onSuccessCallback) await onSuccessCallback();
        }),
        isLoading,
      };
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState.current = '/app/projects';
    setupMutation();
  });

  describe('initialization', () => {
    it('should initialize with create mode by default', async () => {
      const { result } = renderHook(() => useProjectModal());
      const projectData = createProjectData();

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCreateProject).toHaveBeenCalledWith(projectData);
    });

    it('should initialize with specified mode', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'update' }));
      const projectData = createProjectData({ id: 'project-123' });

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockUpdateProject).toHaveBeenCalledWith(projectData);
    });

    it('should expose loading state from mutation hook', () => {
      setupMutation(true);
      const { result } = renderHook(() => useProjectModal());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('handleSave - create mode', () => {
    it('should call createProject with correct data', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'create' }));
      const projectData = createProjectData({ name: 'New Project' });

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCreateProject).toHaveBeenCalledWith(projectData);
      expect(mockCreateProject).toHaveBeenCalledTimes(1);
    });

    it('should not call updateProject in create mode', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'create' }));
      const projectData = createProjectData();

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockUpdateProject).not.toHaveBeenCalled();
    });

    it('should close modal after successful creation', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'create' }));
      const projectData = createProjectData();

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCancelModal).toHaveBeenCalledTimes(1);
    });

    it('should call onSuccess callback after creation', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectModal({ mode: 'create', onSuccess: mockOnSuccess }));
      const projectData = createProjectData();

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'create' }));
      const projectData = createProjectData();

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCreateProject).toHaveBeenCalled();
      expect(mockCancelModal).toHaveBeenCalled();
    });
  });

  describe('handleSave - update mode', () => {
    it('should call updateProject with correct data', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'update' }));
      const projectData = createProjectData({
        id: 'project-123',
        name: 'Updated Project',
      });

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockUpdateProject).toHaveBeenCalledWith(projectData);
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
    });

    it('should not call createProject in update mode', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'update' }));
      const projectData = createProjectData({ id: 'project-123' });

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCreateProject).not.toHaveBeenCalled();
    });

    it('should close modal after successful update', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'update' }));
      const projectData = createProjectData({ id: 'project-123' });

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCancelModal).toHaveBeenCalledTimes(1);
    });

    it('should call onSuccess callback after update', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectModal({ mode: 'update', onSuccess: mockOnSuccess }));
      const projectData = createProjectData({ id: 'project-123' });

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleDelete - navigation behavior', () => {
    it('should not navigate when not viewing projects route', async () => {
      mockLocationState.current = '/app/inbox';
      const { result } = renderHook(() => useProjectModal());

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate when viewing different project', async () => {
      mockLocationState.current = '/app/projects/project-456';
      const { result } = renderHook(() => useProjectModal());

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate to projects when deleting currently viewed project', async () => {
      mockLocationState.current = '/app/projects/project-123';
      const { result } = renderHook(() => useProjectModal());

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROJECTS);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate before calling deleteProject', async () => {
      mockLocationState.current = '/app/projects/project-123';
      const callOrder: string[] = [];

      mockNavigate.mockImplementation(() => {
        callOrder.push('navigate');
      });

      mockDeleteProject.mockImplementation(() => {
        callOrder.push('delete');
      });

      const { result } = renderHook(() => useProjectModal());

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(callOrder).toEqual(['navigate', 'delete']);
    });
  });

  describe('handleDelete - mutation behavior', () => {
    it('should call deleteProject with correct parameters', async () => {
      const { result } = renderHook(() => useProjectModal());

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockDeleteProject).toHaveBeenCalledWith('project-123', 'Test Project');
      expect(mockDeleteProject).toHaveBeenCalledTimes(1);
    });

    it('should close modal after successful deletion', async () => {
      const { result } = renderHook(() => useProjectModal());

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockCancelModal).toHaveBeenCalledTimes(1);
    });

    it('should call onSuccess callback after deletion', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useProjectModal({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(() => useProjectModal());

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockDeleteProject).toHaveBeenCalled();
      expect(mockCancelModal).toHaveBeenCalled();
    });
  });

  describe('hook API', () => {
    it('should expose handleSave method', () => {
      const { result } = renderHook(() => useProjectModal());

      expect(typeof result.current.handleSave).toBe('function');
    });

    it('should expose handleDelete method', () => {
      const { result } = renderHook(() => useProjectModal());

      expect(typeof result.current.handleDelete).toBe('function');
    });

    it('should expose isLoading property', () => {
      const { result } = renderHook(() => useProjectModal());

      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
