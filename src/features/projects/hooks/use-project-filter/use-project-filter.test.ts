import { createMockProject, createMockTask } from '@/core/test-setup/factories';
import { useProjectFilter } from '@/features/projects/hooks/use-project-filter/use-project-filter';
import type { Task } from '@/features/tasks/types';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useProjectFilter', () => {
  const project1 = createMockProject({ $id: 'project-1' });
  const project2 = createMockProject({ $id: 'project-2' });

  const createTasksFixture = (): Task[] => [
    createMockTask({ id: '1', projectId: project1 }),
    createMockTask({ id: '2', projectId: project1 }),
    createMockTask({ id: '3', projectId: project2 }),
    createMockTask({ id: '4', projectId: null }),
    createMockTask({ id: '5', projectId: undefined }),
  ];

  describe('initialization', () => {
    it('should initialize with no filter applied', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      expect(result.current.filterValue).toBeNull();
    });

    it('should return all tasks when no filter is applied', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      expect(result.current.filteredTasks).toEqual(tasks);
    });

    it('should calculate correct count when no filter is applied', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      expect(result.current.filteredCount).toBe(5);
    });

    it('should handle empty tasks array on initialization', () => {
      const { result } = renderHook(() => useProjectFilter({ tasks: [] }));

      expect(result.current.filteredTasks).toEqual([]);
      expect(result.current.filteredCount).toBe(0);
      expect(result.current.filterValue).toBeNull();
    });
  });

  describe('setFilterValue', () => {
    it('should update filter value state', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filterValue).toBe('project-1');
    });

    it('should update filter value to null', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('project-1');
        result.current.setFilterValue(null);
      });

      expect(result.current.filterValue).toBeNull();
    });
  });

  describe('filtering by "all"', () => {
    it('should return all tasks when filter is set to "all"', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('all');
      });

      expect(result.current.filteredTasks).toEqual(tasks);
      expect(result.current.filteredCount).toBe(5);
    });
  });

  describe('filtering by project id', () => {
    it('should filter tasks by specific project id', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredCount).toBe(2);
    });

    it('should return only tasks matching the project id', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filteredTasks[0].id).toBe('1');
      expect(result.current.filteredTasks[1].id).toBe('2');
    });

    it('should filter tasks by different project id', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('project-2');
      });

      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].id).toBe('3');
      expect(result.current.filteredCount).toBe(1);
    });

    it('should handle object-type projectId correctly', () => {
      const tasksWithObjectId: Task[] = [
        createMockTask({ id: '1', projectId: project1 }),
        createMockTask({ id: '2', projectId: project2 }),
      ];

      const { result } = renderHook(() => useProjectFilter({ tasks: tasksWithObjectId }));

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].id).toBe('1');
    });

    it('should return empty array when no tasks match project filter', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('non-existent-project');
      });

      expect(result.current.filteredTasks).toHaveLength(0);
      expect(result.current.filteredCount).toBe(0);
    });
  });

  describe('filtering by "inbox"', () => {
    it('should filter tasks without project id when filter is "inbox"', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('inbox');
      });

      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredCount).toBe(2);
    });

    it('should return only inbox tasks with null or undefined projectId', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('inbox');
      });

      expect(result.current.filteredTasks[0].id).toBe('4');
      expect(result.current.filteredTasks[1].id).toBe('5');
    });
  });

  describe('filter value changes', () => {
    it('should update filtered tasks when changing from one project to another', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

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

    it('should update filtered tasks when changing from project to inbox', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filteredCount).toBe(2);

      act(() => {
        result.current.setFilterValue('inbox');
      });

      expect(result.current.filteredCount).toBe(2);
      expect(result.current.filteredTasks[0].id).toBe('4');
    });

    it('should update filtered tasks when changing from filter to all', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filteredCount).toBe(2);

      act(() => {
        result.current.setFilterValue('all');
      });

      expect(result.current.filteredCount).toBe(5);
    });
  });

  describe('tasks prop changes', () => {
    it('should recalculate filtered tasks when tasks prop changes', () => {
      const initialTasks = createTasksFixture();
      const { result, rerender } = renderHook(({ tasks }) => useProjectFilter({ tasks }), {
        initialProps: { tasks: initialTasks },
      });

      act(() => {
        result.current.setFilterValue('project-1');
      });

      expect(result.current.filteredCount).toBe(2);

      const newTasks: Task[] = [
        createMockTask({ id: '6', projectId: project1 }),
        createMockTask({ id: '7', projectId: project2 }),
      ];

      rerender({ tasks: newTasks });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.filteredTasks[0].id).toBe('6');
    });

    it('should maintain filter when tasks prop changes to empty array', () => {
      const initialTasks = createTasksFixture();
      const { result, rerender } = renderHook(({ tasks }) => useProjectFilter({ tasks }), {
        initialProps: { tasks: initialTasks },
      });

      act(() => {
        result.current.setFilterValue('project-1');
      });

      rerender({ tasks: [] });

      expect(result.current.filterValue).toBe('project-1');
      expect(result.current.filteredTasks).toEqual([]);
      expect(result.current.filteredCount).toBe(0);
    });
  });

  describe('hook API', () => {
    it('should expose all required properties', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      expect(result.current).toHaveProperty('filteredTasks');
      expect(result.current).toHaveProperty('filteredCount');
      expect(result.current).toHaveProperty('filterValue');
    });

    it('should expose all required methods', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      expect(typeof result.current.setFilterValue).toBe('function');
    });

    it('should expose filteredTasks as array', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      expect(Array.isArray(result.current.filteredTasks)).toBe(true);
    });

    it('should expose filteredCount as number', () => {
      const tasks = createTasksFixture();
      const { result } = renderHook(() => useProjectFilter({ tasks }));

      expect(typeof result.current.filteredCount).toBe('number');
    });
  });
});
