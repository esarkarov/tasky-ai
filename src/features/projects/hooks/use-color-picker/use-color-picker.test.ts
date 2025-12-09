import { useColorPicker } from '@/features/projects/hooks/use-color-picker/use-color-picker';
import type { ColorValue } from '@/features/projects/types';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => ({
    isOpen: mockDisclosureState.current.isOpen,
    open: mockDisclosureState.current.open,
    close: mockDisclosureState.current.close,
  }),
}));

const mockDisclosureState = {
  current: {
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
  },
};

describe('useColorPicker', () => {
  const defaultColor: ColorValue = { name: 'blue', hex: '#0000FF' };
  const mockOnColorChange = vi.fn();

  const createColorValue = (name: string, hex: string): ColorValue => ({
    name,
    hex,
  });

  const resetMockDisclosure = () => {
    mockDisclosureState.current = {
      isOpen: false,
      open: vi.fn(),
      close: vi.fn(),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetMockDisclosure();
  });

  describe('initialization', () => {
    it('should initialize with provided default color', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(result.current.selectedColor).toEqual(defaultColor);
    });

    it('should initialize with closed state', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(result.current.isOpen).toBe(false);
    });

    it('should initialize with different default color', () => {
      const customColor = createColorValue('red', '#FF0000');
      const { result } = renderHook(() =>
        useColorPicker({ defaultColor: customColor, onColorChange: mockOnColorChange })
      );

      expect(result.current.selectedColor).toEqual(customColor);
    });
  });

  describe('openSelect', () => {
    it('should call disclosure open method when invoked', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.openSelect();
      });

      expect(mockDisclosureState.current.open).toHaveBeenCalledTimes(1);
    });

    it('should expose disclosure isOpen state as true when opened', () => {
      mockDisclosureState.current.isOpen = true;
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('cancelSelect', () => {
    it('should call disclosure close method when invoked', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.cancelSelect();
      });

      expect(mockDisclosureState.current.close).toHaveBeenCalledTimes(1);
    });

    it('should expose disclosure isOpen state as false when closed', () => {
      mockDisclosureState.current.isOpen = false;
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('handleColorSelect', () => {
    it('should parse color string and update selected color', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.handleColorSelect('red=#FF0000');
      });

      expect(result.current.selectedColor).toEqual(createColorValue('red', '#FF0000'));
    });

    it('should call disclosure close after color selection', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.handleColorSelect('green=#00FF00');
      });

      expect(mockDisclosureState.current.close).toHaveBeenCalledTimes(1);
    });

    it('should call onColorChange with parsed color value', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.handleColorSelect('green=#00FF00');
      });

      expect(mockOnColorChange).toHaveBeenCalledWith(createColorValue('green', '#00FF00'));
      expect(mockOnColorChange).toHaveBeenCalledTimes(1);
    });

    it('should handle color selection with different color formats', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.handleColorSelect('yellow=#FFFF00');
      });

      expect(result.current.selectedColor).toEqual(createColorValue('yellow', '#FFFF00'));
    });

    it('should update color multiple times sequentially', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.handleColorSelect('red=#FF0000');
      });

      expect(result.current.selectedColor).toEqual(createColorValue('red', '#FF0000'));

      act(() => {
        result.current.handleColorSelect('green=#00FF00');
      });

      expect(result.current.selectedColor).toEqual(createColorValue('green', '#00FF00'));
      expect(mockOnColorChange).toHaveBeenCalledTimes(2);
    });

    it('should handle color selection without calling onColorChange when callback is optional', () => {
      const { result } = renderHook(() =>
        useColorPicker({
          defaultColor,
          onColorChange: undefined as unknown as (color: ColorValue) => void,
        })
      );

      act(() => {
        result.current.handleColorSelect('purple=#800080');
      });

      expect(result.current.selectedColor).toEqual(createColorValue('purple', '#800080'));
    });
  });

  describe('color picker workflow', () => {
    it('should complete full open-select-close workflow', () => {
      mockDisclosureState.current.isOpen = false;
      const { result, rerender } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.openSelect();
      });

      expect(mockDisclosureState.current.open).toHaveBeenCalledTimes(1);

      mockDisclosureState.current.isOpen = true;
      rerender();

      act(() => {
        result.current.handleColorSelect('red=#FF0000');
      });

      expect(result.current.selectedColor).toEqual(createColorValue('red', '#FF0000'));
      expect(mockDisclosureState.current.close).toHaveBeenCalledTimes(1);
      expect(mockOnColorChange).toHaveBeenCalledWith(createColorValue('red', '#FF0000'));
    });

    it('should allow canceling without selecting color', () => {
      mockDisclosureState.current.isOpen = false;
      const { result, rerender } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      act(() => {
        result.current.openSelect();
      });

      mockDisclosureState.current.isOpen = true;
      rerender();

      act(() => {
        result.current.cancelSelect();
      });

      expect(mockDisclosureState.current.close).toHaveBeenCalledTimes(1);
      expect(result.current.selectedColor).toEqual(defaultColor);
      expect(mockOnColorChange).not.toHaveBeenCalled();
    });
  });

  describe('hook API', () => {
    it('should expose all required properties', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(result.current).toHaveProperty('isOpen');
      expect(result.current).toHaveProperty('selectedColor');
    });

    it('should expose all required methods', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(typeof result.current.openSelect).toBe('function');
      expect(typeof result.current.cancelSelect).toBe('function');
      expect(typeof result.current.handleColorSelect).toBe('function');
    });

    it('should expose isOpen as boolean', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(typeof result.current.isOpen).toBe('boolean');
    });

    it('should expose selectedColor as ColorValue object', () => {
      const { result } = renderHook(() => useColorPicker({ defaultColor, onColorChange: mockOnColorChange }));

      expect(result.current.selectedColor).toHaveProperty('name');
      expect(result.current.selectedColor).toHaveProperty('hex');
    });
  });
});
