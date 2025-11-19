import type { ProjectListItem } from '@/features/projects/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTaskFormComposite } from './use-task-form-composite';

const mockSetContent = vi.fn();
const mockSetDueDate = vi.fn();
const mockRemoveDueDate = vi.fn();
const mockHandleReset = vi.fn();
const mockHandleProjectChange = vi.fn();
const mockClearProject = vi.fn();

vi.mock('@/features/tasks/hooks/use-task-form-state/use-task-form-state', () => ({
  useTaskFormState: vi.fn(),
}));

vi.mock('@/features/projects/hooks/use-project-selection/use-project-selection', () => ({
  useProjectSelection: vi.fn(),
}));

vi.mock('@/features/tasks/hooks/use-chrone-date-parser/use-chrone-date-parser', () => ({
  useChronoDateParser: vi.fn(),
}));

import { useProjectSelection } from '@/features/projects/hooks/use-project-selection/use-project-selection';
import { useChronoDateParser } from '../use-chrone-date-parser/use-chrone-date-parser';
import { useTaskFormState } from '../use-task-form-state/use-task-form-state';

describe('useTaskFormComposite', () => {
  const mockProjects: ProjectListItem[] = [
    {
      $id: 'project-1',
      name: 'Project 1',
      color_name: 'blue',
      color_hex: '#0000FF',
      $createdAt: '2024-01-01',
      $updatedAt: '2024-01-01',
      $collectionId: 'projects',
      $databaseId: 'db',
      $permissions: [],
    },
  ];

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const setupDefaultMocks = (overrides?: {
    content?: string;
    dueDate?: Date | null;
    projectId?: string | null;
    isValid?: boolean;
  }) => {
    vi.mocked(useTaskFormState).mockReturnValue({
      content: overrides?.content ?? '',
      dueDate: overrides?.dueDate ?? null,
      projectId: overrides?.projectId ?? null,
      formValues: {
        content: overrides?.content ?? '',
        due_date: overrides?.dueDate ?? null,
        projectId: overrides?.projectId ?? null,
      },
      isValid: overrides?.isValid ?? true,
      setContent: mockSetContent,
      setDueDate: mockSetDueDate,
      setProjectId: vi.fn(),
      removeDueDate: mockRemoveDueDate,
      handleReset: mockHandleReset,
    });

    vi.mocked(useProjectSelection).mockReturnValue({
      selectedProject: {
        id: overrides?.projectId ?? null,
        name: overrides?.projectId ? 'Test Project' : '',
        colorHex: overrides?.projectId ? '#000000' : '',
      },
      handleProjectChange: mockHandleProjectChange,
      clearProject: mockClearProject,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
    setupDefaultMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.content).toBe('');
      expect(result.current.dueDate).toBeNull();
      expect(result.current.selectedProject.id).toBeNull();
      expect(result.current.isValid).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should initialize with provided default values', () => {
      setupDefaultMocks({
        content: 'Test task',
        dueDate: new Date('2024-12-25'),
        projectId: 'project-1',
      });

      const { result } = renderHook(() =>
        useTaskFormComposite({
          defaultValues: {
            content: 'Test task',
            due_date: new Date('2024-12-25'),
            projectId: 'project-1',
          },
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.content).toBe('Test task');
      expect(result.current.dueDate).toEqual(new Date('2024-12-25'));
      expect(result.current.selectedProject.id).toBe('project-1');
    });

    it('should enable chrono parsing by default', () => {
      renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(useChronoDateParser).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
    });

    it('should disable chrono parsing when specified', () => {
      renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
          enableChronoParsing: false,
        })
      );

      expect(useChronoDateParser).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    });
  });

  describe('Form Values Composition', () => {
    it('should combine form values with selected project id', () => {
      setupDefaultMocks({
        content: 'Task',
        dueDate: new Date('2024-12-25'),
        projectId: 'project-1',
      });

      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.formValues).toEqual({
        content: 'Task',
        due_date: new Date('2024-12-25'),
        projectId: 'project-1',
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit valid form successfully', async () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '',
          due_date: null,
          projectId: null,
        }),
        undefined
      );
    });

    it('should submit with task id when editing', async () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          defaultValues: {
            id: 'task-123',
            content: 'Task',
            due_date: null,
            projectId: null,
          },
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.anything(), 'task-123');
    });

    it('should not submit invalid form', async () => {
      setupDefaultMocks({ isValid: false });

      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should prevent concurrent submissions', async () => {
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submitPromise);

      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      act(() => {
        result.current.handleSubmit();
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      resolveSubmit!();

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });

    it('should reset form and call onCancel after successful submission', async () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
          onCancel: mockOnCancel,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockHandleReset).toHaveBeenCalled();
      expect(mockClearProject).toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should handle submission errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));

      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Task submission error:', expect.any(Error));
      expect(result.current.isSubmitting).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Form Reset', () => {
    it('should reset form and clear project', () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      act(() => {
        result.current.handleReset();
      });

      expect(mockHandleReset).toHaveBeenCalled();
      expect(mockClearProject).toHaveBeenCalled();
    });
  });

  describe('Exposed API', () => {
    it('should expose all required methods and properties', () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current).toHaveProperty('formValues');
      expect(result.current).toHaveProperty('content');
      expect(result.current).toHaveProperty('dueDate');
      expect(result.current).toHaveProperty('selectedProject');
      expect(result.current).toHaveProperty('isSubmitting');
      expect(result.current).toHaveProperty('isValid');
      expect(result.current).toHaveProperty('setContent');
      expect(result.current).toHaveProperty('setDueDate');
      expect(result.current).toHaveProperty('handleProjectChange');
      expect(result.current).toHaveProperty('removeDueDate');
      expect(result.current).toHaveProperty('handleSubmit');
      expect(result.current).toHaveProperty('handleReset');
    });
  });
});
