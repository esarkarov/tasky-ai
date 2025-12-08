import { createMockProjects } from '@/core/test-setup/factories';
import { useProjectSelection } from '@/features/projects/hooks/use-project-selection/use-project-selection';
import type { ProjectListItem } from '@/features/projects/types';
import { useChronoDateParser } from '@/features/tasks/hooks/use-chrone-date-parser/use-chrone-date-parser';
import { useTaskFormComposite } from '@/features/tasks/hooks/use-task-form-composite/use-task-form-composite';
import { useTaskFormState } from '@/features/tasks/hooks/use-task-form-state/use-task-form-state';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tasks/hooks/use-task-form-state/use-task-form-state', () => ({
  useTaskFormState: vi.fn(),
}));
vi.mock('@/features/projects/hooks/use-project-selection/use-project-selection', () => ({
  useProjectSelection: vi.fn(),
}));
vi.mock('@/features/tasks/hooks/use-chrone-date-parser/use-chrone-date-parser', () => ({
  useChronoDateParser: vi.fn(),
}));

const mockUseTaskFormState = vi.mocked(useTaskFormState);
const mockUseProjectSelection = vi.mocked(useProjectSelection);
const mockUseChronoDateParser = vi.mocked(useChronoDateParser);

describe('useTaskFormComposite', () => {
  const mockSetContent = vi.fn();
  const mockSetDueDate = vi.fn();
  const mockSetProjectId = vi.fn();
  const mockRemoveDueDate = vi.fn();
  const mockHandleReset = vi.fn();
  const mockHandleProjectChange = vi.fn();
  const mockClearProject = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const mockProjects = createMockProjects() as unknown as ProjectListItem[];

  const createFormState = (overrides?: {
    content?: string;
    dueDate?: Date | null;
    projectId?: string | null;
    isValid?: boolean;
  }) => ({
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
    setProjectId: mockSetProjectId,
    removeDueDate: mockRemoveDueDate,
    handleReset: mockHandleReset,
  });

  const createProjectSelection = (overrides?: { projectId?: string | null; name?: string; colorHex?: string }) => ({
    selectedProject: {
      id: overrides?.projectId ?? null,
      name: overrides?.name ?? '',
      colorHex: overrides?.colorHex ?? '',
    },
    handleProjectChange: mockHandleProjectChange,
    clearProject: mockClearProject,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
    mockUseTaskFormState.mockReturnValue(createFormState());
    mockUseProjectSelection.mockReturnValue(createProjectSelection());
    mockUseChronoDateParser.mockReturnValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize with default empty state', () => {
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
      const mockDate = new Date('2024-12-25T10:00:00.000Z');
      mockUseTaskFormState.mockReturnValue(
        createFormState({
          content: 'Test task',
          dueDate: mockDate,
          projectId: 'project-1',
        })
      );
      mockUseProjectSelection.mockReturnValue(
        createProjectSelection({
          projectId: 'project-1',
          name: 'Test Project',
          colorHex: '#000000',
        })
      );

      const { result } = renderHook(() =>
        useTaskFormComposite({
          defaultValues: {
            content: 'Test task',
            due_date: mockDate,
            projectId: 'project-1',
          },
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.content).toBe('Test task');
      expect(result.current.dueDate).toEqual(mockDate);
      expect(result.current.selectedProject.id).toBe('project-1');
    });

    it('should call useTaskFormState with default values', () => {
      const mockDate = new Date('2024-12-25T10:00:00.000Z');
      const defaultValues = {
        content: 'Test task',
        due_date: mockDate,
        projectId: 'project-1',
      };

      renderHook(() =>
        useTaskFormComposite({
          defaultValues,
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(mockUseTaskFormState).toHaveBeenCalledWith({ defaultValues });
    });

    it('should call useProjectSelection with projects and default projectId', () => {
      const defaultValues = {
        content: 'Test task',
        due_date: null,
        projectId: 'project-1',
      };

      renderHook(() =>
        useTaskFormComposite({
          defaultValues,
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(mockUseProjectSelection).toHaveBeenCalledWith({
        defaultProjectId: 'project-1',
        projects: mockProjects,
      });
    });
  });

  describe('chrono date parsing', () => {
    it('should enable chrono parsing by default', () => {
      renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(mockUseChronoDateParser).toHaveBeenCalledWith({
        content: '',
        onDateParsed: mockSetDueDate,
        enabled: true,
      });
    });

    it('should disable chrono parsing when specified', () => {
      renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
          enableChronoParsing: false,
        })
      );

      expect(mockUseChronoDateParser).toHaveBeenCalledWith({
        content: '',
        onDateParsed: mockSetDueDate,
        enabled: false,
      });
    });

    it('should pass form content to chrono parser', () => {
      mockUseTaskFormState.mockReturnValue(createFormState({ content: 'Meeting tomorrow' }));

      renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(mockUseChronoDateParser).toHaveBeenCalledWith({
        content: 'Meeting tomorrow',
        onDateParsed: mockSetDueDate,
        enabled: true,
      });
    });
  });

  describe('formValues composition', () => {
    it('should combine form values with selected project id', () => {
      const mockDate = new Date('2024-12-25T10:00:00.000Z');
      mockUseTaskFormState.mockReturnValue(
        createFormState({
          content: 'Test task',
          dueDate: mockDate,
          projectId: 'old-project',
        })
      );
      mockUseProjectSelection.mockReturnValue(createProjectSelection({ projectId: 'project-1' }));

      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.formValues).toEqual({
        content: 'Test task',
        due_date: mockDate,
        projectId: 'project-1',
      });
    });

    it('should update formValues when project selection changes', () => {
      mockUseTaskFormState.mockReturnValue(createFormState({ content: 'Test task' }));
      mockUseProjectSelection.mockReturnValue(createProjectSelection({ projectId: null }));

      const { result, rerender } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.formValues.projectId).toBeNull();

      mockUseProjectSelection.mockReturnValue(createProjectSelection({ projectId: 'project-1' }));

      rerender();

      expect(result.current.formValues.projectId).toBe('project-1');
    });
  });

  describe('handleSubmit', () => {
    it('should submit form with valid data', async () => {
      mockUseTaskFormState.mockReturnValue(createFormState({ content: 'Test task', isValid: true }));

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
        {
          content: 'Test task',
          due_date: null,
          projectId: null,
        },
        undefined
      );
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should submit with task id when editing existing task', async () => {
      mockUseTaskFormState.mockReturnValue(createFormState({ content: 'Updated task', isValid: true }));

      const { result } = renderHook(() =>
        useTaskFormComposite({
          defaultValues: {
            id: 'task-123',
            content: 'Original task',
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

    it('should not submit when form is invalid', async () => {
      mockUseTaskFormState.mockReturnValue(createFormState({ isValid: false }));

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

    it('should set isSubmitting to true during submission', async () => {
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
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      resolveSubmit!();

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it('should reset form after successful submission', async () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockHandleReset).toHaveBeenCalledTimes(1);
      expect(mockClearProject).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel after successful submission', async () => {
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

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should handle submission without onCancel callback', async () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockHandleReset).toHaveBeenCalled();
    });

    it('should log error and set isSubmitting to false on submission failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Submission failed');
      mockOnSubmit.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Task submission error:', error);
      expect(result.current.isSubmitting).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should not reset form on submission failure', async () => {
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

      expect(mockHandleReset).not.toHaveBeenCalled();
      expect(mockClearProject).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleReset', () => {
    it('should reset form state and clear project', () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      act(() => {
        result.current.handleReset();
      });

      expect(mockHandleReset).toHaveBeenCalledTimes(1);
      expect(mockClearProject).toHaveBeenCalledTimes(1);
    });

    it('should set isSubmitting to false when reset', () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('hook API', () => {
    it('should expose all required properties', () => {
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
    });

    it('should expose all required methods', () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(typeof result.current.setContent).toBe('function');
      expect(typeof result.current.setDueDate).toBe('function');
      expect(typeof result.current.handleProjectChange).toBe('function');
      expect(typeof result.current.removeDueDate).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.handleReset).toBe('function');
    });

    it('should expose setContent from form state', () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.setContent).toBe(mockSetContent);
    });

    it('should expose handleProjectChange from project selection', () => {
      const { result } = renderHook(() =>
        useTaskFormComposite({
          projects: mockProjects,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.handleProjectChange).toBe(mockHandleProjectChange);
    });
  });
});
