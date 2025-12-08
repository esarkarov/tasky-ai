import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TaskFormInput } from '../../types';
import { useTaskFormState } from './use-task-form-state';

describe('useTaskFormState', () => {
  const mockDate = new Date('2024-12-25T10:00:00.000Z');
  const createDefaultValues = (overrides?: Partial<TaskFormInput>): TaskFormInput => ({
    id: 'task-1',
    content: 'Test task',
    due_date: mockDate,
    projectId: 'project-1',
    ...overrides,
  });

  describe('initialization', () => {
    it('should initialize with provided default values', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      expect(result.current.content).toBe('Test task');
      expect(result.current.dueDate).toEqual(mockDate);
      expect(result.current.projectId).toBe('project-1');
      expect(result.current.isValid).toBe(true);
    });

    it('should initialize with empty state when no defaults provided', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(result.current.content).toBe('');
      expect(result.current.dueDate).toBeNull();
      expect(result.current.projectId).toBeNull();
      expect(result.current.isValid).toBe(false);
    });

    it('should initialize with partial default values', () => {
      const defaultValues = createDefaultValues({ projectId: null, due_date: null });
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      expect(result.current.content).toBe('Test task');
      expect(result.current.dueDate).toBeNull();
      expect(result.current.projectId).toBeNull();
    });
  });

  describe('formValues composition', () => {
    it('should combine all form fields into formValues object', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      expect(result.current.formValues).toEqual({
        id: 'task-1',
        content: 'Test task',
        due_date: mockDate,
        projectId: 'project-1',
      });
    });

    it('should update formValues when content changes', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('New content');
      });

      expect(result.current.formValues.content).toBe('New content');
    });

    it('should update formValues when due date changes', () => {
      const { result } = renderHook(() => useTaskFormState());
      const newDate = new Date('2024-12-31T15:00:00.000Z');

      act(() => {
        result.current.setDueDate(newDate);
      });

      expect(result.current.formValues.due_date).toEqual(newDate);
    });

    it('should update formValues when project id changes', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setProjectId('project-2');
      });

      expect(result.current.formValues.projectId).toBe('project-2');
    });

    it('should maintain id from default values in formValues', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      act(() => {
        result.current.setContent('Updated content');
      });

      expect(result.current.formValues.id).toBe('task-1');
    });
  });

  describe('setContent', () => {
    it('should update content with non-empty value', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('Updated task');
      });

      expect(result.current.content).toBe('Updated task');
    });

    it('should update content to empty string', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      act(() => {
        result.current.setContent('');
      });

      expect(result.current.content).toBe('');
    });

    it('should accept whitespace-only content', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('   ');
      });

      expect(result.current.content).toBe('   ');
    });
  });

  describe('setDueDate', () => {
    it('should update due date with new date', () => {
      const { result } = renderHook(() => useTaskFormState());
      const newDate = new Date('2024-12-31T15:00:00.000Z');

      act(() => {
        result.current.setDueDate(newDate);
      });

      expect(result.current.dueDate).toEqual(newDate);
    });

    it('should update due date to null', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      act(() => {
        result.current.setDueDate(null);
      });

      expect(result.current.dueDate).toBeNull();
    });
  });

  describe('removeDueDate', () => {
    it('should set due date to null when called', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      act(() => {
        result.current.removeDueDate();
      });

      expect(result.current.dueDate).toBeNull();
      expect(result.current.formValues.due_date).toBeNull();
    });
  });

  describe('setProjectId', () => {
    it('should update project id with new value', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setProjectId('project-123');
      });

      expect(result.current.projectId).toBe('project-123');
    });

    it('should update project id to null', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      act(() => {
        result.current.setProjectId(null);
      });

      expect(result.current.projectId).toBeNull();
    });
  });

  describe('validation', () => {
    it('should be valid when content has non-whitespace characters', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      expect(result.current.isValid).toBe(true);
    });

    it('should be invalid when content is empty', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(result.current.isValid).toBe(false);
    });

    it('should be invalid when content is whitespace-only', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('   \n  \t  ');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should become valid when non-empty content is added', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setContent('New task');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should become invalid when content is cleared', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.setContent('');
      });

      expect(result.current.isValid).toBe(false);
    });
  });

  describe('handleReset', () => {
    it('should reset all fields to provided default values', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useTaskFormState({ defaultValues }));

      act(() => {
        result.current.setContent('Changed task');
        result.current.setDueDate(new Date('2024-12-31T15:00:00.000Z'));
        result.current.setProjectId('project-2');
      });

      expect(result.current.content).toBe('Changed task');

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.content).toBe('Test task');
      expect(result.current.dueDate).toEqual(mockDate);
      expect(result.current.projectId).toBe('project-1');
    });

    it('should reset all fields to empty state when no defaults provided', () => {
      const { result } = renderHook(() => useTaskFormState());

      act(() => {
        result.current.setContent('Some task');
        result.current.setDueDate(new Date('2024-12-25T10:00:00.000Z'));
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

  describe('multiple state updates', () => {
    it('should handle sequential updates to all fields', () => {
      const { result } = renderHook(() => useTaskFormState());
      const newDate = new Date('2024-12-25T10:00:00.000Z');

      act(() => {
        result.current.setContent('Task 1');
        result.current.setDueDate(newDate);
        result.current.setProjectId('project-1');
      });

      expect(result.current.formValues).toEqual({
        id: undefined,
        content: 'Task 1',
        due_date: newDate,
        projectId: 'project-1',
      });
    });

    it('should maintain consistency between individual values and formValues', () => {
      const { result } = renderHook(() => useTaskFormState());
      const newDate = new Date('2024-12-31T15:00:00.000Z');

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

  describe('hook API', () => {
    it('should expose all required state properties', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(result.current).toHaveProperty('formValues');
      expect(result.current).toHaveProperty('content');
      expect(result.current).toHaveProperty('dueDate');
      expect(result.current).toHaveProperty('projectId');
      expect(result.current).toHaveProperty('isValid');
    });

    it('should expose all required methods', () => {
      const { result } = renderHook(() => useTaskFormState());

      expect(typeof result.current.setContent).toBe('function');
      expect(typeof result.current.setDueDate).toBe('function');
      expect(typeof result.current.setProjectId).toBe('function');
      expect(typeof result.current.removeDueDate).toBe('function');
      expect(typeof result.current.handleReset).toBe('function');
    });
  });
});
