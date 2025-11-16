import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskMutation } from './use-task-mutation';
import { TaskFormInput } from '@/features/tasks/types';

const mockSubmit = vi.fn();
const mockToast = vi.fn();
const mockExecuteWithToast = vi.fn();
const mockBuildDescription = vi.fn();

let mockFetcherState: 'idle' | 'loading' | 'submitting' = 'idle';

vi.mock('react-router', () => ({
  useFetcher: () => ({
    submit: mockSubmit,
    state: mockFetcherState,
  }),
}));

vi.mock('@/shared/hooks/use-toast/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/shared/utils/operation/operation.utils', () => ({
  executeWithToast: (...args: Parameters<typeof mockExecuteWithToast>) => mockExecuteWithToast(...args),
  buildTaskSuccessDescription: (...args: Parameters<typeof mockBuildDescription>) => mockBuildDescription(...args),
}));

describe('useTaskMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcherState = 'idle';
    mockExecuteWithToast.mockResolvedValue(undefined);
    mockBuildDescription.mockReturnValue('Task description');
  });

  describe('Initial State', () => {
    it('should initialize with isLoading false', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current.isLoading).toBe(false);
    });

    it('should provide all mutation functions', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(typeof result.current.handleCreate).toBe('function');
      expect(typeof result.current.handleUpdate).toBe('function');
      expect(typeof result.current.handleDelete).toBe('function');
    });
  });

  describe('Create Task', () => {
    it('should call executeWithToast with correct parameters', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData: TaskFormInput = {
        content: 'New task',
        projectId: null,
        due_date: null,
      };

      await result.current.handleCreate(taskData);

      expect(mockBuildDescription).toHaveBeenCalledWith('New task', 'Task created:');
      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.objectContaining({}),
        'Task description',
        undefined
      );
    });

    it('should not call executeWithToast when data is undefined', async () => {
      const { result } = renderHook(() => useTaskMutation());

      await result.current.handleCreate(undefined as unknown as TaskFormInput);

      expect(mockExecuteWithToast).not.toHaveBeenCalled();
    });

    it('should call onSuccess callback after creation', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));
      const taskData: TaskFormInput = {
        content: 'Task with callback',
        projectId: null,
        due_date: null,
      };

      mockExecuteWithToast.mockImplementation(async (_operation, _toast, _messages, _description, callback) => {
        if (callback) callback();
      });

      await result.current.handleCreate(taskData);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update Task', () => {
    it('should call executeWithToast with task id from data', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData: TaskFormInput = {
        id: 'task-123',
        content: 'Updated task',
        projectId: null,
        due_date: null,
      };

      await result.current.handleUpdate(taskData);

      expect(mockBuildDescription).toHaveBeenCalledWith('Updated task', 'Task updated:');
      expect(mockExecuteWithToast).toHaveBeenCalled();
    });

    it('should use taskId parameter over data.id', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData: TaskFormInput = {
        id: 'task-123',
        content: 'Updated task',
        projectId: null,
        due_date: null,
      };

      await result.current.handleUpdate(taskData, 'task-456');

      expect(mockExecuteWithToast).toHaveBeenCalled();
    });

    it('should not call executeWithToast when no id is provided', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData: TaskFormInput = {
        content: 'Task without id',
        projectId: null,
        due_date: null,
      };

      await result.current.handleUpdate(taskData);

      expect(mockExecuteWithToast).not.toHaveBeenCalled();
    });

    it('should call onSuccess callback after update', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));
      const taskData: TaskFormInput = {
        id: 'task-123',
        content: 'Updated task',
        projectId: null,
        due_date: null,
      };

      mockExecuteWithToast.mockImplementation(async (_operation, _toast, _messages, _description, callback) => {
        if (callback) callback();
      });

      await result.current.handleUpdate(taskData);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delete Task', () => {
    it('should call executeWithToast with task id', async () => {
      const { result } = renderHook(() => useTaskMutation());

      await result.current.handleDelete('task-123');

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.objectContaining({}),
        expect.anything()
      );
    });

    it('should not call executeWithToast when id is empty', async () => {
      const { result } = renderHook(() => useTaskMutation());

      await result.current.handleDelete('');

      expect(mockExecuteWithToast).not.toHaveBeenCalled();
    });

    it('should not call onSuccess for delete operations', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));

      mockExecuteWithToast.mockImplementation(async (_operation, _toast, _messages, _description, callback) => {
        if (callback) callback();
      });

      await result.current.handleDelete('task-123');

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should set isLoading to true when fetcher state is loading', () => {
      mockFetcherState = 'loading';
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading to true when fetcher state is submitting', () => {
      mockFetcherState = 'submitting';
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading to false when fetcher state is idle', () => {
      mockFetcherState = 'idle';
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Exposed API', () => {
    it('should expose all required methods and properties', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current).toHaveProperty('handleCreate');
      expect(result.current).toHaveProperty('handleUpdate');
      expect(result.current).toHaveProperty('handleDelete');
      expect(result.current).toHaveProperty('isLoading');
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with all optional fields', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData: TaskFormInput = {
        content: 'Minimal task',
        projectId: 'proj-123',
        due_date: new Date('2024-12-31'),
      };

      await result.current.handleCreate(taskData);

      expect(mockExecuteWithToast).toHaveBeenCalled();
    });

    it('should handle empty task content', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData: TaskFormInput = {
        content: '',
        projectId: null,
        due_date: null,
      };

      await result.current.handleCreate(taskData);

      expect(mockBuildDescription).toHaveBeenCalledWith('', 'Task created:');
    });
  });
});
