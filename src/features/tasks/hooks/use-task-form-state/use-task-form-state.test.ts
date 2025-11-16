import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTaskFormState } from './use-task-form-state';

describe('useTaskFormState', () => {
  const defaultValues = {
    id: 'task-1',
    content: 'Test task',
    due_date: new Date('2024-12-25'),
    projectId: 'project-1',
  };

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      expect(result.current.content).toBe('Test task');
      expect(result.current.dueDate).toEqual(new Date('2024-12-25'));
      expect(result.current.projectId).toBe('project-1');
      expect(result.current.isValid).toBe(true);
    });

    it('should initialize with empty values when no defaults provided', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(result.current.content).toBe('');
      expect(result.current.dueDate).toBeNull();
      expect(result.current.projectId).toBeNull();
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('Form Values', () => {
    it('should combine all form fields into formValues', () => {
      const defaultValues = {
        id: 'task-1',
        content: 'Test task',
        due_date: new Date('2024-12-25'),
        projectId: 'project-1',
      };

      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      expect(result.current.formValues).toEqual({
        id: 'task-1',
        content: 'Test task',
        due_date: new Date('2024-12-25'),
        projectId: 'project-1',
      });
    });

    it('should update formValues when individual fields change', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('New content');
      });

      expect(result.current.formValues.content).toBe('New content');
    });
  });

  describe('Content Management', () => {
    it('should update content', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('Updated task');
      });

      expect(result.current.content).toBe('Updated task');
      expect(result.current.isValid).toBe(true);
    });

    it('should handle empty content', () => {
      const { result } = renderHook(() =>
        useTaskFormState({
          defaultValues,
        })
      );

      act(() => {
        result.current.setContent('');
      });

      expect(result.current.content).toBe('');
      expect(result.current.isValid).toBe(false);
    });

    it('should handle whitespace-only content as invalid', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('   ');
      });

      expect(result.current.content).toBe('   ');
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('Due Date Management', () => {
    it('should update due date', () => {
      const { result } = renderHook(() => useTaskFormState());
      const newDate = new Date('2024-12-31');

      act(() => {
        result.current.setDueDate(newDate);
      });

      expect(result.current.dueDate).toEqual(newDate);
      expect(result.current.formValues.due_date).toEqual(newDate);
    });

    it('should remove due date', () => {
      const { result } = renderHook(() =>
        useTaskFormState({
          defaultValues,
        })
      );

      act(() => {
        result.current.removeDueDate();
      });

      expect(result.current.dueDate).toBeNull();
      expect(result.current.formValues.due_date).toBeNull();
    });

    it('should set due date to null', () => {
      const { result } = renderHook(() =>
        useTaskFormState({
          defaultValues,
        })
      );

      act(() => {
        result.current.setDueDate(null);
      });

      expect(result.current.dueDate).toBeNull();
    });
  });

  describe('Project Management', () => {
    it('should update project ID', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setProjectId('project-123');
      });

      expect(result.current.projectId).toBe('project-123');
      expect(result.current.formValues.projectId).toBe('project-123');
    });

    it('should clear project ID', () => {
      const { result } = renderHook(() =>
        useTaskFormState({
          defaultValues,
        })
      );

      act(() => {
        result.current.setProjectId(null);
      });

      expect(result.current.projectId).toBeNull();
      expect(result.current.formValues.projectId).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should be valid when content is not empty', () => {
      const { result } = renderHook(() =>
        useTaskFormState({
          defaultValues,
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('should be invalid when content is empty', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(result.current.isValid).toBe(false);
    });

    it('should be invalid when content is only whitespace', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('   \n  \t  ');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should become valid when content is added', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setContent('New task');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should become invalid when content is removed', () => {
      const { result } = renderHook(() =>
        useTaskFormState({
          defaultValues,
        })
      );

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.setContent('');
      });

      expect(result.current.isValid).toBe(false);
    });
  });

  describe('Form Reset', () => {
    it('should reset to default values', () => {
      const defaultValues = {
        id: 'task-1',
        content: 'Original task',
        due_date: new Date('2024-12-25'),
        projectId: 'project-1',
      };

      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      act(() => {
        result.current.setContent('Changed task');
        result.current.setDueDate(new Date('2024-12-31'));
        result.current.setProjectId('project-2');
      });

      expect(result.current.content).toBe('Changed task');

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.content).toBe('Original task');
      expect(result.current.dueDate).toEqual(new Date('2024-12-25'));
      expect(result.current.projectId).toBe('project-1');
    });

    it('should reset to empty values when no defaults provided', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('Some task');
        result.current.setDueDate(new Date('2024-12-25'));
        result.current.setProjectId('project-1');
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.content).toBe('');
      expect(result.current.dueDate).toBeNull();
      expect(result.current.projectId).toBeNull();
    });
  });

  describe('Multiple State Updates', () => {
    it('should handle multiple field updates in sequence', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('Task 1');
        result.current.setDueDate(new Date('2024-12-25'));
        result.current.setProjectId('project-1');
      });

      expect(result.current.formValues).toEqual({
        id: undefined,
        content: 'Task 1',
        due_date: new Date('2024-12-25'),
        projectId: 'project-1',
      });
    });

    it('should maintain consistency across all exposed values', () => {
      const { result } = renderHook(() => useTaskFormState());
      const newDate = new Date('2024-12-31');

      act(() => {
        result.current.setContent('Test');
        result.current.setDueDate(newDate);
        result.current.setProjectId('proj-1');
      });

      expect(result.current.content).toBe('Test');
      expect(result.current.dueDate).toEqual(newDate);
      expect(result.current.projectId).toBe('proj-1');
      expect(result.current.formValues.content).toBe('Test');
      expect(result.current.formValues.due_date).toEqual(newDate);
      expect(result.current.formValues.projectId).toBe('proj-1');
    });
  });

  describe('Exposed API', () => {
    it('should expose all required properties and methods', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(result.current).toHaveProperty('formValues');
      expect(result.current).toHaveProperty('content');
      expect(result.current).toHaveProperty('dueDate');
      expect(result.current).toHaveProperty('projectId');
      expect(result.current).toHaveProperty('isValid');
      expect(result.current).toHaveProperty('setContent');
      expect(result.current).toHaveProperty('setDueDate');
      expect(result.current).toHaveProperty('setProjectId');
      expect(result.current).toHaveProperty('removeDueDate');
      expect(result.current).toHaveProperty('handleReset');
    });
  });
});
