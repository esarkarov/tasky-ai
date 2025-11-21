import type { ProjectFormInput } from '@/features/projects/types';
import { ROUTES } from '@/shared/constants';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectModal } from './use-project-modal';

const mockNavigate = vi.fn();
const mockCancelModal = vi.fn();
const mockCreateProject = vi.fn();
const mockUpdateProject = vi.fn();
const mockDeleteProject = vi.fn();
const mockOnSuccess = vi.fn();

let mockPathname = '/app/projects';

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => ({ close: mockCancelModal }),
}));

vi.mock('../use-project-mutation/use-project-mutation', () => ({
  useProjectMutation: vi.fn(({ onSuccess }) => ({
    createProject: mockCreateProject.mockImplementation(async () => {
      if (onSuccess) await onSuccess();
    }),
    updateProject: mockUpdateProject.mockImplementation(async () => {
      if (onSuccess) await onSuccess();
    }),
    deleteProject: mockDeleteProject.mockImplementation(async () => {
      if (onSuccess) await onSuccess();
    }),
    isLoading: false,
  })),
}));

describe('useProjectModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/app/projects';
  });

  describe('handleSave', () => {
    it('should create project when mode is create', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'create', onSuccess: mockOnSuccess }));

      const projectData: ProjectFormInput = {
        name: 'New Project',
        color_name: 'blue',
        color_hex: '#0000FF',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCreateProject).toHaveBeenCalledWith(projectData);
      expect(mockUpdateProject).not.toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockCancelModal).toHaveBeenCalled();
    });

    it('should update project when mode is update', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'update', onSuccess: mockOnSuccess }));

      const projectData: ProjectFormInput = {
        id: 'project-123',
        name: 'Updated Project',
        color_name: 'red',
        color_hex: '#FF0000',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockUpdateProject).toHaveBeenCalledWith(projectData);
      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockCancelModal).toHaveBeenCalled();
    });

    it('should default to create mode when no mode specified', async () => {
      const { result } = renderHook(() => useProjectModal());

      const projectData: ProjectFormInput = {
        name: 'Project',
        color_name: 'green',
        color_hex: '#00FF00',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCreateProject).toHaveBeenCalledWith(projectData);
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(() => useProjectModal({ mode: 'create' }));

      const projectData: ProjectFormInput = {
        name: 'Project',
        color_name: 'blue',
        color_hex: '#0000FF',
        ai_task_gen: false,
        task_gen_prompt: '',
      };

      await act(async () => {
        await result.current.handleSave(projectData);
      });

      expect(mockCreateProject).toHaveBeenCalled();
      expect(mockCancelModal).toHaveBeenCalled();
    });
  });

  describe('handleDelete', () => {
    it('should delete project without navigation when not viewing project', async () => {
      mockPathname = '/app/inbox';

      const { result } = renderHook(() => useProjectModal({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockDeleteProject).toHaveBeenCalledWith('project-123', 'Test Project');
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockCancelModal).toHaveBeenCalled();
    });

    it('should navigate away when deleting currently viewed project', async () => {
      mockPathname = '/app/projects/project-123';

      const { result } = renderHook(() => useProjectModal({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROJECTS);
      expect(mockDeleteProject).toHaveBeenCalledWith('project-123', 'Test Project');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockCancelModal).toHaveBeenCalled();
    });

    it('should not navigate when viewing different project', async () => {
      mockPathname = '/app/projects/project-456';

      const { result } = renderHook(() => useProjectModal());

      await act(async () => {
        await result.current.handleDelete('project-123', 'Test Project');
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockDeleteProject).toHaveBeenCalledWith('project-123', 'Test Project');
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

  describe('isLoading', () => {
    it('should expose loading state from mutation hook', () => {
      const { result } = renderHook(() => useProjectModal());

      expect(result.current.isLoading).toBe(false);
    });
  });
});
