import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTaskCompletion } from './use-task-completion';

const mockSubmit = vi.fn();
const mockToast = vi.fn();

vi.mock('react-router', () => ({
  useFetcher: () => ({
    submit: mockSubmit,
    state: 'idle',
  }),
}));

vi.mock('@/shared/hooks/use-toast/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('@/shared/constants', () => ({
  HTTP_METHODS: {
    PUT: 'PUT',
  },
  TIMING: {
    TOAST_DURATION: 3000,
  },
  ROUTES: {
    APP: '/app',
  },
}));

vi.mock('@/features/tasks/constants', () => ({
  TASK_TOAST_CONTENTS: {
    COMPLETE: {
      success: 'Task completed successfully',
      UNCOMPLETE: 'Task marked as incomplete',
      error: 'Failed to update task',
      errorDescription: 'Please try again',
    },
  },
}));

describe('useTaskCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockResolvedValue(undefined);
  });

  describe('Toggle Complete', () => {
    it('should complete a task and show toast with undo action', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: true }));

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify({ id: 'task-1', completed: true }), {
        action: '/app',
        method: 'PUT',
        encType: 'application/json',
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '1 task completed',
          duration: 3000,
          className: 'border-l-4 border-[#ea580c]',
          action: expect.anything(),
        })
      );
    });

    it('should uncomplete a task and show appropriate toast', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: true }));

      await act(async () => {
        await result.current.toggleComplete('task-1', false);
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify({ id: 'task-1', completed: false }), {
        action: '/app',
        method: 'PUT',
        encType: 'application/json',
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task marked as incomplete',
          duration: 3000,
          className: 'border-l-4 border-[#ea580c]',
        })
      );
    });

    it('should not show undo action when enableUndo is false', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: false }));

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task completed successfully',
          duration: 3000,
          className: 'border-l-4 border-[#ea580c]',
        })
      );
      expect(mockToast).toHaveBeenCalledWith(
        expect.not.objectContaining({
          action: expect.anything(),
        })
      );
    });

    it('should default to enableUndo true when not provided', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '1 task completed',
          action: expect.anything(),
        })
      );
    });

    it('should not submit when taskId is empty', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete('', true);
      });

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when submission fails', async () => {
      mockSubmit.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Failed to update task',
          description: 'Please try again',
          duration: 3000,
          variant: 'destructive',
        });
      });
    });

    it('should not call onSuccess when submission fails', async () => {
      const mockOnSuccess = vi.fn();
      mockSubmit.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTaskCompletion({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('Success Callback', () => {
    it('should call onSuccess after successful completion', async () => {
      const mockOnSuccess = vi.fn();

      const { result } = renderHook(() => useTaskCompletion({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      expect(mockSubmit).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalled();
    });
  });

  describe('Undo Action', () => {
    it('should allow undoing a completed task', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: true }));

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      const toastCall = mockToast.mock.calls[0][0];
      const undoAction = toastCall.action;

      expect(undoAction).toBeDefined();
      expect(undoAction.props.altText).toBe('Undo task completion');

      mockSubmit.mockClear();
      mockToast.mockClear();

      await act(async () => {
        await undoAction.props.onClick();
      });

      expect(mockSubmit).toHaveBeenCalledWith(JSON.stringify({ id: 'task-1', completed: false }), {
        action: '/app',
        method: 'PUT',
        encType: 'application/json',
      });
    });
  });

  describe('Loading State', () => {
    it('should return isLoading as false when fetcher is idle', () => {
      const { result } = renderHook(() => useTaskCompletion());

      expect(result.current.isLoading).toBe(false);
    });

    // it('should return isLoading as true when fetcher is not idle', () => {
    //   vi.mocked(await import('react-router')).useFetcher = () =>
    //     ({
    //       submit: mockSubmit,
    //       state: 'submitting',
    //     }) as ReturnType<typeof import('react-router').useFetcher>;

    //   const { result } = renderHook(() => useTaskCompletion());

    //   expect(result.current.isLoading).toBe(true);
    // });
  });

  describe('Multiple Calls', () => {
    it('should handle multiple task completions', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      await act(async () => {
        await result.current.toggleComplete('task-2', true);
      });

      expect(mockSubmit).toHaveBeenCalledTimes(2);
      expect(mockToast).toHaveBeenCalledTimes(2);
    });
  });
});
