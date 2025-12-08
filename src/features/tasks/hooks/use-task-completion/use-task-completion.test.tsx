import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Fetcher } from 'react-router';
import { useTaskCompletion } from './use-task-completion';

const mockSubmit = vi.fn();
const mockToast = vi.fn();
const mockFetcherState = { current: 'idle' as Fetcher['state'] };

vi.mock('react-router', () => ({
  useFetcher: () => ({
    submit: mockSubmit,
    state: mockFetcherState.current,
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
  const mockTaskId = 'task-123';
  const expectedSubmitConfig = {
    action: '/app',
    method: 'PUT',
    encType: 'application/json',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcherState.current = 'idle';
    mockSubmit.mockResolvedValue(undefined);
  });

  const getToastCall = (callIndex = 0) => mockToast.mock.calls[callIndex]?.[0];

  describe('initialization', () => {
    it('should initialize with loading state as false', () => {
      const { result } = renderHook(() => useTaskCompletion());

      expect(result.current.isLoading).toBe(false);
    });

    it('should initialize with enableUndo true by default', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      const toastCall = getToastCall();
      expect(toastCall.action).toBeDefined();
    });

    it('should initialize with enableUndo false when specified', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: false }));

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      const toastCall = getToastCall();
      expect(toastCall.action).toBeUndefined();
    });
  });

  describe('toggleComplete - task completion', () => {
    it('should submit completion request with correct payload', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      expect(mockSubmit).toHaveBeenCalledWith(
        JSON.stringify({ id: mockTaskId, completed: true }),
        expectedSubmitConfig
      );
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it('should submit uncompletion request with correct payload', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, false);
      });

      expect(mockSubmit).toHaveBeenCalledWith(
        JSON.stringify({ id: mockTaskId, completed: false }),
        expectedSubmitConfig
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

    it('should handle multiple task completions sequentially', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete('task-1', true);
      });

      await act(async () => {
        await result.current.toggleComplete('task-2', true);
      });

      expect(mockSubmit).toHaveBeenCalledTimes(2);
      expect(mockSubmit).toHaveBeenNthCalledWith(
        1,
        JSON.stringify({ id: 'task-1', completed: true }),
        expectedSubmitConfig
      );
      expect(mockSubmit).toHaveBeenNthCalledWith(
        2,
        JSON.stringify({ id: 'task-2', completed: true }),
        expectedSubmitConfig
      );
    });
  });

  describe('toggleComplete - toast notifications', () => {
    it('should show completion toast with undo action when enableUndo is true', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: true }));

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
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

    it('should show completion toast without undo action when enableUndo is false', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: false }));

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      const toastCall = getToastCall();
      expect(toastCall).toEqual({
        title: 'Task completed successfully',
        duration: 3000,
        className: 'border-l-4 border-[#ea580c]',
      });
    });

    it('should show uncompletion toast without undo action', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: true }));

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, false);
      });

      const toastCall = getToastCall();
      expect(toastCall).toEqual({
        title: 'Task marked as incomplete',
        duration: 3000,
        className: 'border-l-4 border-[#ea580c]',
      });
    });
  });

  describe('toggleComplete - undo functionality', () => {
    it('should provide undo action with correct props', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: true }));

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      const toastCall = getToastCall();
      expect(toastCall.action.props.altText).toBe('Undo task completion');
      expect(typeof toastCall.action.props.onClick).toBe('function');
    });

    it('should uncomplete task when undo action is clicked', async () => {
      const { result } = renderHook(() => useTaskCompletion({ enableUndo: true }));

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      const undoAction = getToastCall().action;

      mockSubmit.mockClear();
      mockToast.mockClear();

      await act(async () => {
        await undoAction.props.onClick();
      });

      expect(mockSubmit).toHaveBeenCalledWith(
        JSON.stringify({ id: mockTaskId, completed: false }),
        expectedSubmitConfig
      );
    });
  });

  describe('toggleComplete - success callback', () => {
    it('should call onSuccess after successful completion', async () => {
      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() => useTaskCompletion({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onSuccess when submission fails', async () => {
      const mockOnSuccess = vi.fn();
      mockSubmit.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTaskCompletion({ onSuccess: mockOnSuccess }));

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should complete successfully without onSuccess callback', async () => {
      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
      });

      expect(mockSubmit).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalled();
    });
  });

  describe('toggleComplete - error handling', () => {
    it('should show error toast when submission fails', async () => {
      mockSubmit.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, true);
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

    it('should handle error during uncompletion', async () => {
      mockSubmit.mockRejectedValueOnce(new Error('Server error'));

      const { result } = renderHook(() => useTaskCompletion());

      await act(async () => {
        await result.current.toggleComplete(mockTaskId, false);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('isLoading state', () => {
    it('should return false when fetcher state is idle', () => {
      mockFetcherState.current = 'idle';
      const { result } = renderHook(() => useTaskCompletion());

      expect(result.current.isLoading).toBe(false);
    });

    it('should return true when fetcher state is submitting', () => {
      mockFetcherState.current = 'submitting';
      const { result } = renderHook(() => useTaskCompletion());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return true when fetcher state is loading', () => {
      mockFetcherState.current = 'loading';
      const { result } = renderHook(() => useTaskCompletion());

      expect(result.current.isLoading).toBe(true);
    });
  });
});
