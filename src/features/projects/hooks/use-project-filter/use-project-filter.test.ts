import { createMockProject, createMockTask } from '@/core/tests/factories';
import type { Task } from '@/features/tasks/types';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useProjectFilter } from './use-project-filter';

describe('useProjectFilter', () => {
  const mockTasks: Task[] = [
    createMockTask({ id: '1', projectId: createMockProject({ $id: 'project-1' }) }),
    createMockTask({ id: '2', projectId: createMockProject({ $id: 'project-1' }) }),
    createMockTask({ id: '3', projectId: createMockProject({ $id: 'project-2' }) }),
    createMockTask({ id: '4', projectId: null }),
    createMockTask({ id: '5', projectId: undefined }),
  ];

  describe('initial state', () => {
    it('initializes with no filter and returns all tasks', () => {
      const { result } = renderHook(() => useProjectFilter({ tasks: mockTasks }));

      expect(result.current.filterValue).toBeNull();
      expect(result.current.filteredTasks).toEqual(mockTasks);
      expect(result.current.filteredCount).toBe(5);
    });
  });

  describe('basic filtering', () => {
    it('returns all tasks when filter is set to "all"', () => {
      const { result } = renderHook(() => useProjectFilter({ tasks: mockTasks }));

      act(() => {
        result.current.setFilterValue('all');
      });

      expect(result.current.filteredTasks).toEqual(mockTasks);
      expect(result.current.filteredCount).toBe(5);
    });

    it('filters tasks by project id', () => {
      const { result } = renderHook(() => useProjectFilter({ tasks: mockTasks }));

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredTasks[0].id).toBe('1');
      expect(result.current.filteredTasks[1].id).toBe('2');
      expect(result.current.filteredCount).toBe(2);
    });

    it('filters inbox tasks when filter is set to "inbox"', () => {
      const { result } = renderHook(() => useProjectFilter({ tasks: mockTasks }));

      act(() => {
        result.current.setFilterValue('inbox');
      });

      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredTasks[0].id).toBe('4');
      expect(result.current.filteredTasks[1].id).toBe('5');
      expect(result.current.filteredCount).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('handles tasks with object-type projectId', () => {
      const tasksWithObjectId: Task[] = [
        createMockTask({ id: '1', projectId: createMockProject({ $id: 'project-1' }) }),
        createMockTask({ id: '2', projectId: createMockProject({ $id: 'project-2' }) }),
      ];

      const { result } = renderHook(() => useProjectFilter({ tasks: tasksWithObjectId }));

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].id).toBe('1');
    });

    it('returns empty array when no tasks match the filter', () => {
      const { result } = renderHook(() => useProjectFilter({ tasks: mockTasks }));

      act(() => {
        result.current.setFilterValue('non-existent-project');
      });

      expect(result.current.filteredTasks).toHaveLength(0);
      expect(result.current.filteredCount).toBe(0);
    });

    it('handles empty tasks array', () => {
      const { result } = renderHook(() => useProjectFilter({ tasks: [] }));

      expect(result.current.filteredTasks).toEqual([]);
      expect(result.current.filteredCount).toBe(0);
    });
  });

  describe('reactivity to changes', () => {
    it('updates filtered tasks when filter value changes', () => {
      const { result } = renderHook(() => useProjectFilter({ tasks: mockTasks }));

      act(() => {
        result.current.setFilterValue('project-1');
      });
      expect(result.current.filteredCount).toBe(2);

      act(() => {
        result.current.setFilterValue('project-2');
      });
      expect(result.current.filteredCount).toBe(1);
      expect(result.current.filteredTasks[0].id).toBe('3');
    });

    it('recalculates filtered tasks when tasks prop changes', () => {
      const { result, rerender } = renderHook(({ tasks }) => useProjectFilter({ tasks }), {
        initialProps: { tasks: mockTasks },
      });

      act(() => {
        result.current.setFilterValue('project-1');
      });
      expect(result.current.filteredCount).toBe(2);

      const newTasks: Task[] = [createMockTask({ id: '6', projectId: createMockProject({ $id: 'project-1' }) })];

      rerender({ tasks: newTasks });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.filteredTasks[0].id).toBe('6');
    });
  });
});
