import { PROJECT_COLORS } from '@/features/projects/constants';
import { useProjectFormState } from '@/features/projects/hooks/use-project-form-state/use-project-form-state';
import type { ColorValue, ProjectInput } from '@/features/projects/types';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useProjectFormState', () => {
  const defaultColor = PROJECT_COLORS[0];

  const createDefaultValues = (overrides?: Partial<ProjectInput>): ProjectInput => ({
    id: 'project-123',
    name: 'My Project',
    color_name: 'red',
    color_hex: '#FF0000',
    ...overrides,
  });

  const createColor = (name: string, hex: string): ColorValue => ({
    name,
    hex,
  });

  describe('initialization', () => {
    it('should initialize with empty name when no defaults provided', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.name).toBe('');
    });

    it('should initialize with default color when no defaults provided', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.color).toEqual({
        name: defaultColor.name,
        hex: defaultColor.hex,
      });
    });

    it('should initialize with invalid state when no defaults provided', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.isValid).toBe(false);
    });

    it('should initialize with provided default name', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      expect(result.current.name).toBe('My Project');
    });

    it('should initialize with provided default color', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      expect(result.current.color).toEqual(createColor('red', '#FF0000'));
    });

    it('should initialize with valid state when defaults provided', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('formValues composition', () => {
    it('should include all data from default values in formValues', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      expect(result.current.formValues.id).toBe('project-123');
      expect(result.current.formValues.name).toBe('My Project');
      expect(result.current.formValues.color_name).toBe('red');
      expect(result.current.formValues.color_hex).toBe('#FF0000');
    });

    it('should have undefined id when no defaults provided', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.formValues.id).toBeUndefined();
    });

    it('should maintain consistency between state and formValues', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('Test');
        result.current.setColor(createColor('yellow', '#FFFF00'));
      });

      expect(result.current.formValues).toEqual({
        id: undefined,
        name: 'Test',
        color_name: 'yellow',
        color_hex: '#FFFF00',
      });
    });
  });

  describe('setName', () => {
    it('should update name with non-empty value', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('New Project');
      });

      expect(result.current.name).toBe('New Project');
    });

    it('should update formValues name when name changes', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('New Project');
      });

      expect(result.current.formValues.name).toBe('New Project');
    });

    it('should accept empty string', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      act(() => {
        result.current.setName('');
      });

      expect(result.current.name).toBe('');
    });

    it('should accept whitespace-only string', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('   ');
      });

      expect(result.current.name).toBe('   ');
    });
  });

  describe('setColor', () => {
    it('should update color with new value', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setColor(createColor('green', '#00FF00'));
      });

      expect(result.current.color).toEqual(createColor('green', '#00FF00'));
    });

    it('should update formValues color_name when color changes', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setColor(createColor('green', '#00FF00'));
      });

      expect(result.current.formValues.color_name).toBe('green');
    });

    it('should update formValues color_hex when color changes', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setColor(createColor('green', '#00FF00'));
      });

      expect(result.current.formValues.color_hex).toBe('#00FF00');
    });

    it('should handle multiple color changes', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setColor(createColor('green', '#00FF00'));
      });

      expect(result.current.color).toEqual(createColor('green', '#00FF00'));

      act(() => {
        result.current.setColor(createColor('purple', '#800080'));
      });

      expect(result.current.color).toEqual(createColor('purple', '#800080'));
    });
  });

  describe('validation', () => {
    it('should be invalid when name is empty', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.isValid).toBe(false);
    });

    it('should be invalid when name is whitespace-only', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('   ');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should be valid when name has non-whitespace characters', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('New Project');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should become invalid when name is cleared', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.setName('');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should become valid when non-empty name is added', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setName('Project');
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('handleReset', () => {
    it('should reset name to default value', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      act(() => {
        result.current.setName('Changed');
      });

      expect(result.current.name).toBe('Changed');

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.name).toBe('My Project');
    });

    it('should reset color to default value', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      act(() => {
        result.current.setColor(createColor('purple', '#800080'));
      });

      expect(result.current.color.name).toBe('purple');

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.color).toEqual(createColor('red', '#FF0000'));
    });

    it('should reset name to empty when no defaults provided', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('Some Name');
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.name).toBe('');
    });

    it('should reset color to default color when no defaults provided', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setColor(createColor('purple', '#800080'));
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.color).toEqual({
        name: defaultColor.name,
        hex: defaultColor.hex,
      });
    });

    it('should reset all fields to defaults simultaneously', () => {
      const defaultValues = createDefaultValues();
      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      act(() => {
        result.current.setName('Changed');
        result.current.setColor(createColor('yellow', '#FFFF00'));
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.name).toBe('My Project');
      expect(result.current.color).toEqual(createColor('red', '#FF0000'));
    });
  });

  describe('hook API', () => {
    it('should expose all required properties', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current).toHaveProperty('formValues');
      expect(result.current).toHaveProperty('name');
      expect(result.current).toHaveProperty('color');
      expect(result.current).toHaveProperty('isValid');
    });

    it('should expose all required methods', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(typeof result.current.setName).toBe('function');
      expect(typeof result.current.setColor).toBe('function');
      expect(typeof result.current.handleReset).toBe('function');
    });

    it('should expose name as string', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(typeof result.current.name).toBe('string');
    });

    it('should expose color as object with name and hex', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.color).toHaveProperty('name');
      expect(result.current.color).toHaveProperty('hex');
    });

    it('should expose isValid as boolean', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(typeof result.current.isValid).toBe('boolean');
    });
  });
});
