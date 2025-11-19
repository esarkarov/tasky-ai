import type { ColorValue } from '@/features/projects/types';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useColorPicker } from './use-color-picker';

describe('useColorPicker', () => {
  const defaultColor: ColorValue = { name: 'blue', hex: '#0000FF' };
  const mockOnColorChange = vi.fn();

  beforeEach(() => {
    mockOnColorChange.mockClear();
  });

  describe('initial state', () => {
    it('initializes with default color and closed state', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(result.current.selectedColor).toEqual(defaultColor);
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('open and close behavior', () => {
    it('opens the color picker', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.openSelect();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('closes the color picker', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.openSelect();
      });

      act(() => {
        result.current.cancelSelect();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('handle color selection', () => {
    it('handles color selection and updates state', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.openSelect();
      });

      act(() => {
        result.current.handleColorSelect('red=#FF0000');
      });

      expect(result.current.selectedColor).toEqual({ name: 'red', hex: '#FF0000' });
      expect(result.current.isOpen).toBe(false);
    });

    it('calls onColorChange callback when color is selected', () => {
      const onColorChange = vi.fn();
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange }));

      act(() => {
        result.current.handleColorSelect('green=#00FF00');
      });

      expect(onColorChange).toHaveBeenCalledWith({ name: 'green', hex: '#00FF00' });
      expect(onColorChange).toHaveBeenCalledTimes(1);
    });

    it('handles color selection without onColorChange callback', () => {
      const { result } = renderHook(() =>
        useColorPicker({
          defaultColor,
          onColorChange: (() => {}) as (color: ColorValue) => void,
        })
      );

      act(() => {
        result.current.handleColorSelect('yellow=#FFFF00');
      });

      expect(result.current.selectedColor).toEqual({ name: 'yellow', hex: '#FFFF00' });
    });
  });
});
