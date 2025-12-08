import { useTaskMutation } from '@/features/tasks/hooks/use-task-mutation/use-task-mutation';
import type { TaskFormInput } from '@/features/tasks/types';
import { renderHook } from '@testing-library/react';
import type { Fetcher } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSubmit = vi.fn();
const mockToast = vi.fn();
const mockExecuteWithToast = vi.fn();
const mockBuildDescription = vi.fn();
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
  buildTaskSuccessDescription: vi.fn((...args: Parameters<typeof mockBuildDescription>) =>
    mockBuildDescription(...args)
  ),
}));

describe('useTaskMutation', () => {
  const createTaskData = (overrides?: Partial<TaskFormInput>): TaskFormInput => ({
    content: 'Test task',
    projectId: null,
    due_date: null,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcherState.current = 'idle';
    mockExecuteWithToast.mockResolvedValue(undefined);
    mockBuildDescription.mockReturnValue('Task description');
  });

  describe('initialization', () => {
    it('should initialize with loading state as false', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current.isLoading).toBe(false);
    });

    it('should expose handleCreate method', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(typeof result.current.handleCreate).toBe('function');
    });

    it('should expose handleUpdate method', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(typeof result.current.handleUpdate).toBe('function');
    });

    it('should expose handleDelete method', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(typeof result.current.handleDelete).toBe('function');
    });
  });

  describe('handleCreate', () => {
    it('should build description with correct parameters', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData({ content: 'New task' });

      await result.current.handleCreate(taskData);

      expect(mockBuildDescription).toHaveBeenCalledWith('New task', 'Task created:');
    });

    it('should call executeWithToast with correct parameters', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData();

      await result.current.handleCreate(taskData);

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        'Task description',
        undefined
      );
    });

    it('should pass onSuccess callback to executeWithToast', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));
      const taskData = createTaskData();

      await result.current.handleCreate(taskData);

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        'Task description',
        onSuccess
      );
    });

    it('should invoke onSuccess callback after successful creation', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));
      const taskData = createTaskData();

      mockExecuteWithToast.mockImplementation(async (_operation, _toast, _messages, _description, callback) => {
        if (callback) callback();
      });

      await result.current.handleCreate(taskData);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should not call executeWithToast when data is undefined', async () => {
      const { result } = renderHook(() => useTaskMutation());

      await result.current.handleCreate(undefined as unknown as TaskFormInput);

      expect(mockExecuteWithToast).not.toHaveBeenCalled();
      expect(mockBuildDescription).not.toHaveBeenCalled();
    });

    it('should handle task with project id', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData({ projectId: 'proj-123' });

      await result.current.handleCreate(taskData);

      expect(mockExecuteWithToast).toHaveBeenCalled();
    });

    it('should handle task with due date', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData({ due_date: new Date('2024-12-31T10:00:00.000Z') });

      await result.current.handleCreate(taskData);

      expect(mockExecuteWithToast).toHaveBeenCalled();
    });

    it('should handle empty content', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData({ content: '' });

      await result.current.handleCreate(taskData);

      expect(mockBuildDescription).toHaveBeenCalledWith('', 'Task created:');
    });
  });

  describe('handleUpdate', () => {
    it('should build description with correct parameters', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData({ id: 'task-123', content: 'Updated task' });

      await result.current.handleUpdate(taskData);

      expect(mockBuildDescription).toHaveBeenCalledWith('Updated task', 'Task updated:');
    });

    it('should call executeWithToast with task id from data', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData({ id: 'task-123' });

      await result.current.handleUpdate(taskData);

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        'Task description',
        undefined
      );
    });

    it('should use taskId parameter over data.id when provided', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData({ id: 'task-123' });

      await result.current.handleUpdate(taskData, 'task-456');

      expect(mockExecuteWithToast).toHaveBeenCalled();
    });

    it('should pass onSuccess callback to executeWithToast', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));
      const taskData = createTaskData({ id: 'task-123' });

      await result.current.handleUpdate(taskData);

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        'Task description',
        onSuccess
      );
    });

    it('should invoke onSuccess callback after successful update', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));
      const taskData = createTaskData({ id: 'task-123' });

      mockExecuteWithToast.mockImplementation(async (_operation, _toast, _messages, _description, callback) => {
        if (callback) callback();
      });

      await result.current.handleUpdate(taskData);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should not call executeWithToast when no id is provided', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData();

      await result.current.handleUpdate(taskData);

      expect(mockExecuteWithToast).not.toHaveBeenCalled();
      expect(mockBuildDescription).not.toHaveBeenCalled();
    });

    it('should not call executeWithToast when taskId parameter is undefined', async () => {
      const { result } = renderHook(() => useTaskMutation());
      const taskData = createTaskData();

      await result.current.handleUpdate(taskData, undefined);

      expect(mockExecuteWithToast).not.toHaveBeenCalled();
    });
  });

  describe('handleDelete', () => {
    it('should call executeWithToast with correct parameters', async () => {
      const { result } = renderHook(() => useTaskMutation());

      await result.current.handleDelete('task-123');

      expect(mockExecuteWithToast).toHaveBeenCalledWith(
        expect.any(Function),
        mockToast,
        expect.any(Object),
        expect.any(String)
      );
    });

    it('should not pass onSuccess callback to executeWithToast', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));

      await result.current.handleDelete('task-123');

      const executeWithToastCall = mockExecuteWithToast.mock.calls[0];
      expect(executeWithToastCall[4]).toBeUndefined();
    });

    it('should not invoke onSuccess callback after deletion', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskMutation({ onSuccess }));

      mockExecuteWithToast.mockImplementation(async (_operation, _toast, _messages, _description, callback) => {
        if (callback) callback();
      });

      await result.current.handleDelete('task-123');

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should not call executeWithToast when id is empty string', async () => {
      const { result } = renderHook(() => useTaskMutation());

      await result.current.handleDelete('');

      expect(mockExecuteWithToast).not.toHaveBeenCalled();
    });

    it('should handle task deletion with valid id', async () => {
      const { result } = renderHook(() => useTaskMutation());

      await result.current.handleDelete('task-xyz');

      expect(mockExecuteWithToast).toHaveBeenCalledTimes(1);
    });
  });

  describe('isLoading state', () => {
    it('should return false when fetcher state is idle', () => {
      mockFetcherState.current = 'idle';
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current.isLoading).toBe(false);
    });

    it('should return true when fetcher state is loading', () => {
      mockFetcherState.current = 'loading';
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return true when fetcher state is submitting', () => {
      mockFetcherState.current = 'submitting';
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('hook API', () => {
    it('should expose all required properties', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(result.current).toHaveProperty('handleCreate');
      expect(result.current).toHaveProperty('handleUpdate');
      expect(result.current).toHaveProperty('handleDelete');
      expect(result.current).toHaveProperty('isLoading');
    });

    it('should expose methods as functions', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(typeof result.current.handleCreate).toBe('function');
      expect(typeof result.current.handleUpdate).toBe('function');
      expect(typeof result.current.handleDelete).toBe('function');
    });

    it('should expose isLoading as boolean', () => {
      const { result } = renderHook(() => useTaskMutation());

      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
