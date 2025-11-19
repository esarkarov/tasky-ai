import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjectFormComposite } from './use-project-form-composite';
import type { ProjectInput } from '@/features/projects/types';

const mockSetColor = vi.fn();
const mockHandleReset = vi.fn();
const mockOpenSelect = vi.fn();
const mockCancelSelect = vi.fn();
const mockHandleColorSelect = vi.fn();
const mockSetAiEnabled = vi.fn();
const mockSetAiPrompt = vi.fn();
const mockAiHandleReset = vi.fn();
const mockOnSubmit = vi.fn();

vi.mock('@/features/projects/hooks/use-project-form-state/use-project-form-state', () => ({
  useProjectFormState: vi.fn(({ defaultValues }) => ({
    formValues: {
      id: defaultValues?.id,
      name: defaultValues?.name || '',
      color_name: defaultValues?.color_name || 'blue',
      color_hex: defaultValues?.color_hex || '#0000FF',
    },
    name: defaultValues?.name || '',
    color: {
      name: defaultValues?.color_name || 'blue',
      hex: defaultValues?.color_hex || '#0000FF',
    },
    isValid: defaultValues?.name ? defaultValues.name.trim().length > 0 : false,
    setName: vi.fn(),
    setColor: mockSetColor,
    handleReset: mockHandleReset,
  })),
}));

vi.mock('@/features/projects/hooks/use-color-picker/use-color-picker', () => ({
  useColorPicker: vi.fn(() => ({
    selectedColor: { name: 'blue', hex: '#0000FF' },
    isOpen: false,
    openSelect: mockOpenSelect,
    cancelSelect: mockCancelSelect,
    handleColorSelect: mockHandleColorSelect,
  })),
}));

vi.mock('@/features/ai/hooks/use-ai-task-generations', () => ({
  useAITaskGeneration: vi.fn(() => ({
    aiEnabled: false,
    aiPrompt: '',
    isValid: true,
    setAiEnabled: mockSetAiEnabled,
    setAiPrompt: mockSetAiPrompt,
    handleReset: mockAiHandleReset,
  })),
}));

describe('useProjectFormComposite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(result.current.name).toBe('');
      expect(result.current.color).toEqual({ name: 'blue', hex: '#0000FF' });
      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.aiPrompt).toBe('');
      expect(result.current.colorPickerOpen).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(false);
    });

    it('should initialize with provided default values', () => {
      const defaultValues: ProjectInput = {
        id: 'project-123',
        name: 'Test Project',
        color_name: 'red',
        color_hex: '#FF0000',
      };

      const { result } = renderHook(() =>
        useProjectFormComposite({
          defaultValues,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.name).toBe('Test Project');
      expect(result.current.formValues).toEqual({
        id: 'project-123',
        name: 'Test Project',
        color_name: 'red',
        color_hex: '#FF0000',
        ai_task_gen: false,
        task_gen_prompt: '',
      });
    });

    it('should respect enableAI parameter', () => {
      const { result } = renderHook(() =>
        useProjectFormComposite({
          onSubmit: mockOnSubmit,
          enableAI: true,
        })
      );

      expect(result.current.aiEnabled).toBe(false);
    });
  });

  describe('formValues', () => {
    it('should compose form values correctly', () => {
      const defaultValues: ProjectInput = {
        name: 'My Project',
        color_name: 'green',
        color_hex: '#00FF00',
      };

      const { result } = renderHook(() =>
        useProjectFormComposite({
          defaultValues,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.formValues).toEqual({
        id: undefined,
        name: 'My Project',
        color_name: 'green',
        color_hex: '#00FF00',
        ai_task_gen: false,
        task_gen_prompt: '',
      });
    });
  });

  describe('color picker interactions', () => {
    it('should open color picker', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.setColorPickerOpen(true);
      });

      expect(mockOpenSelect).toHaveBeenCalled();
    });

    it('should close color picker', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.setColorPickerOpen(false);
      });

      expect(mockCancelSelect).toHaveBeenCalled();
    });

    it('should handle color selection', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.handleColorSelect('purple=#800080');
      });

      expect(mockHandleColorSelect).toHaveBeenCalledWith('purple=#800080');
    });
  });

  describe('handleSubmit', () => {
    it('should submit form when valid', async () => {
      const defaultValues: ProjectInput = {
        name: 'Valid Project',
        color_name: 'blue',
        color_hex: '#0000FF',
      };

      const { result } = renderHook(() =>
        useProjectFormComposite({
          defaultValues,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: undefined,
        name: 'Valid Project',
        color_name: 'blue',
        color_hex: '#0000FF',
        ai_task_gen: false,
        task_gen_prompt: '',
      });
    });

    it('should not submit when invalid', async () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should prevent double submission', async () => {
      const defaultValues: ProjectInput = {
        name: 'Project',
        color_name: 'blue',
        color_hex: '#0000FF',
      };

      mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 50)));

      const { result } = renderHook(() =>
        useProjectFormComposite({
          defaultValues,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        result.current.handleSubmit();
      });

      await act(async () => {
        await Promise.resolve();
      });

      await act(async () => {
        result.current.handleSubmit();
      });

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should handle submission errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Submission failed');
      mockOnSubmit.mockRejectedValueOnce(error);

      const defaultValues: ProjectInput = {
        name: 'Project',
        color_name: 'blue',
        color_hex: '#0000FF',
      };

      const { result } = renderHook(() =>
        useProjectFormComposite({
          defaultValues,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Project submission error:', error);
      expect(result.current.isSubmitting).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should reset form after successful submission', async () => {
      const defaultValues: ProjectInput = {
        name: 'Project',
        color_name: 'blue',
        color_hex: '#0000FF',
      };

      const { result } = renderHook(() =>
        useProjectFormComposite({
          defaultValues,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockHandleReset).toHaveBeenCalled();
      expect(mockCancelSelect).toHaveBeenCalled();
      expect(mockAiHandleReset).toHaveBeenCalled();
    });
  });

  describe('handleReset', () => {
    it('should reset all form state', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.handleReset();
      });

      expect(mockHandleReset).toHaveBeenCalled();
      expect(mockCancelSelect).toHaveBeenCalled();
      expect(mockAiHandleReset).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('AI task generation', () => {
    it('should expose AI setters', () => {
      const { result } = renderHook(() =>
        useProjectFormComposite({
          onSubmit: mockOnSubmit,
          enableAI: true,
        })
      );

      act(() => {
        result.current.setAiEnabled(true);
      });

      expect(mockSetAiEnabled).toHaveBeenCalledWith(true);

      act(() => {
        result.current.setAiPrompt('Generate tasks');
      });

      expect(mockSetAiPrompt).toHaveBeenCalledWith('Generate tasks');
    });
  });
});
