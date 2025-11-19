import { PROJECT_COLORS } from '@/features/projects/constants';
import type { ProjectInput } from '@/features/projects/types';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useProjectFormState } from './use-project-form-state';

describe('useProjectFormState', () => {
  describe('initial state', () => {
    it('should initialize with empty values when no defaults provided', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.name).toBe('');
      expect(result.current.color).toEqual({
        name: PROJECT_COLORS[0].name,
        hex: PROJECT_COLORS[0].hex,
      });
      expect(result.current.formValues).toEqual({
        id: undefined,
        name: '',
        color_name: PROJECT_COLORS[0].name,
        color_hex: PROJECT_COLORS[0].hex,
      });
      expect(result.current.isValid).toBe(false);
    });

    it('should initialize with default values when provided', () => {
      const defaultValues: ProjectInput = {
        id: 'project-123',
        name: 'My Project',
        color_name: 'red',
        color_hex: '#FF0000',
      };

      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      expect(result.current.name).toBe('My Project');
      expect(result.current.color).toEqual({
        name: 'red',
        hex: '#FF0000',
      });
      expect(result.current.formValues).toEqual(defaultValues);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('setName', () => {
    it('should update name and validate correctly', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setName('New Project');
      });

      expect(result.current.name).toBe('New Project');
      expect(result.current.isValid).toBe(true);
      expect(result.current.formValues.name).toBe('New Project');
    });

    it('should invalidate form when name is only whitespace', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('   ');
      });

      expect(result.current.name).toBe('   ');
      expect(result.current.isValid).toBe(false);
    });
  });
  describe('setColor', () => {
    it('should update color', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setColor({ name: 'green', hex: '#00FF00' });
      });

      expect(result.current.color).toEqual({
        name: 'green',
        hex: '#00FF00',
      });
      expect(result.current.formValues.color_name).toBe('green');
      expect(result.current.formValues.color_hex).toBe('#00FF00');
    });
  });

  describe('handleReset', () => {
    it('should reset to default values', () => {
      const defaultValues: ProjectInput = {
        id: 'project-123',
        name: 'Original',
        color_name: 'blue',
        color_hex: '#0000FF',
      };

      const { result } = renderHook(() => useProjectFormState({ defaultValues }));

      act(() => {
        result.current.setName('Changed');
        result.current.setColor({ name: 'red', hex: '#FF0000' });
      });

      expect(result.current.name).toBe('Changed');
      expect(result.current.color.name).toBe('red');

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.name).toBe('Original');
      expect(result.current.color).toEqual({
        name: 'blue',
        hex: '#0000FF',
      });
    });

    it('should reset to empty when no defaults provided', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('Some Name');
        result.current.setColor({ name: 'purple', hex: '#800080' });
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.name).toBe('');
      expect(result.current.color).toEqual({
        name: PROJECT_COLORS[0].name,
        hex: PROJECT_COLORS[0].hex,
      });
    });
  });

  describe('formValues', () => {
    it('should maintain formValues consistency with state', () => {
      const { result } = renderHook(() => useProjectFormState({}));

      act(() => {
        result.current.setName('Test');
        result.current.setColor({ name: 'yellow', hex: '#FFFF00' });
      });

      expect(result.current.formValues).toEqual({
        id: undefined,
        name: 'Test',
        color_name: 'yellow',
        color_hex: '#FFFF00',
      });
    });
  });
});
