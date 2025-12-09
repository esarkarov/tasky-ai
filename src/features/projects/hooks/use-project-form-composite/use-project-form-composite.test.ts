import { useAITaskGeneration } from '@/features/ai/hooks/use-ai-task-generations';
import { useColorPicker } from '@/features/projects/hooks/use-color-picker/use-color-picker';
import { useProjectFormComposite } from '@/features/projects/hooks/use-project-form-composite/use-project-form-composite';
import { useProjectFormState } from '@/features/projects/hooks/use-project-form-state/use-project-form-state';
import type { ProjectInput } from '@/features/projects/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/projects/hooks/use-project-form-state/use-project-form-state');
vi.mock('@/features/projects/hooks/use-color-picker/use-color-picker');
vi.mock('@/features/ai/hooks/use-ai-task-generations');

const mockUseProjectFormState = vi.mocked(useProjectFormState);
const mockUseColorPicker = vi.mocked(useColorPicker);
const mockUseAITaskGeneration = vi.mocked(useAITaskGeneration);

describe('useProjectFormComposite', () => {
  const mockSetName = vi.fn();
  const mockSetColor = vi.fn();
  const mockFormHandleReset = vi.fn();
  const mockOpenSelect = vi.fn();
  const mockCancelSelect = vi.fn();
  const mockHandleColorSelect = vi.fn();
  const mockSetAiEnabled = vi.fn();
  const mockSetAiPrompt = vi.fn();
  const mockAiHandleReset = vi.fn();
  const mockOnSubmit = vi.fn();

  const createFormState = (overrides?: {
    name?: string;
    colorName?: string;
    colorHex?: string;
    isValid?: boolean;
    id?: string;
  }) => ({
    formValues: {
      id: overrides?.id,
      name: overrides?.name ?? '',
      color_name: overrides?.colorName ?? 'blue',
      color_hex: overrides?.colorHex ?? '#0000FF',
    },
    name: overrides?.name ?? '',
    color: {
      name: overrides?.colorName ?? 'blue',
      hex: overrides?.colorHex ?? '#0000FF',
    },
    isValid: overrides?.isValid ?? false,
    setName: mockSetName,
    setColor: mockSetColor,
    handleReset: mockFormHandleReset,
  });

  const createColorPicker = (overrides?: { colorName?: string; colorHex?: string; isOpen?: boolean }) => ({
    selectedColor: {
      name: overrides?.colorName ?? 'blue',
      hex: overrides?.colorHex ?? '#0000FF',
    },
    isOpen: overrides?.isOpen ?? false,
    openSelect: mockOpenSelect,
    cancelSelect: mockCancelSelect,
    handleColorSelect: mockHandleColorSelect,
  });

  const createAIGeneration = (overrides?: { aiEnabled?: boolean; aiPrompt?: string; isValid?: boolean }) => ({
    aiEnabled: overrides?.aiEnabled ?? false,
    aiPrompt: overrides?.aiPrompt ?? '',
    isValid: overrides?.isValid ?? true,
    setAiEnabled: mockSetAiEnabled,
    setAiPrompt: mockSetAiPrompt,
    handleReset: mockAiHandleReset,
    toggleAI: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
    mockUseProjectFormState.mockReturnValue(createFormState());
    mockUseColorPicker.mockReturnValue(createColorPicker());
    mockUseAITaskGeneration.mockReturnValue(createAIGeneration());
  });

  describe('initialization', () => {
    it('should initialize with default empty state', () => {
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

      mockUseProjectFormState.mockReturnValue(
        createFormState({
          id: 'project-123',
          name: 'Test Project',
          colorName: 'red',
          colorHex: '#FF0000',
          isValid: true,
        })
      );

      mockUseColorPicker.mockReturnValue(createColorPicker({ colorName: 'red', colorHex: '#FF0000' }));

      const { result } = renderHook(() => useProjectFormComposite({ defaultValues, onSubmit: mockOnSubmit }));

      expect(result.current.name).toBe('Test Project');
      expect(result.current.color).toEqual({ name: 'red', hex: '#FF0000' });
    });

    it('should call useProjectFormState with default values', () => {
      const defaultValues: ProjectInput = {
        name: 'Test Project',
        color_name: 'blue',
        color_hex: '#0000FF',
      };

      renderHook(() => useProjectFormComposite({ defaultValues, onSubmit: mockOnSubmit }));

      expect(mockUseProjectFormState).toHaveBeenCalledWith({ defaultValues });
    });

    it('should call useAITaskGeneration with enableAI parameter', () => {
      renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit, enableAI: true }));

      expect(mockUseAITaskGeneration).toHaveBeenCalledWith({ enabled: true });
    });

    it('should default enableAI to false when not provided', () => {
      renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(mockUseAITaskGeneration).toHaveBeenCalledWith({ enabled: false });
    });
  });

  describe('formValues composition', () => {
    it('should combine form values with AI fields', () => {
      mockUseProjectFormState.mockReturnValue(
        createFormState({
          id: 'proj-1',
          name: 'My Project',
          colorName: 'green',
          colorHex: '#00FF00',
        })
      );

      mockUseAITaskGeneration.mockReturnValue(createAIGeneration({ aiEnabled: true, aiPrompt: 'Generate tasks' }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(result.current.formValues).toEqual({
        id: 'proj-1',
        name: 'My Project',
        color_name: 'green',
        color_hex: '#00FF00',
        ai_task_gen: true,
        task_gen_prompt: 'Generate tasks',
      });
    });

    it('should update formValues when AI state changes', () => {
      mockUseAITaskGeneration.mockReturnValue(createAIGeneration({ aiEnabled: false, aiPrompt: '' }));

      const { result, rerender } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(result.current.formValues.ai_task_gen).toBe(false);

      mockUseAITaskGeneration.mockReturnValue(createAIGeneration({ aiEnabled: true, aiPrompt: 'Test prompt' }));

      rerender();

      expect(result.current.formValues.ai_task_gen).toBe(true);
      expect(result.current.formValues.task_gen_prompt).toBe('Test prompt');
    });
  });

  describe('isValid computation', () => {
    it('should be invalid when form is invalid', () => {
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: false }));
      mockUseAITaskGeneration.mockReturnValue(createAIGeneration({ isValid: true }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(result.current.isValid).toBe(false);
    });

    it('should be invalid when AI is invalid', () => {
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: true }));
      mockUseAITaskGeneration.mockReturnValue(createAIGeneration({ isValid: false }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(result.current.isValid).toBe(false);
    });

    it('should be valid when both form and AI are valid', () => {
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: true }));
      mockUseAITaskGeneration.mockReturnValue(createAIGeneration({ isValid: true }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('setColorPickerOpen', () => {
    it('should call openSelect when set to true', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.setColorPickerOpen(true);
      });

      expect(mockOpenSelect).toHaveBeenCalledTimes(1);
      expect(mockCancelSelect).not.toHaveBeenCalled();
    });

    it('should call cancelSelect when set to false', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.setColorPickerOpen(false);
      });

      expect(mockCancelSelect).toHaveBeenCalledTimes(1);
      expect(mockOpenSelect).not.toHaveBeenCalled();
    });
  });

  describe('handleColorSelect', () => {
    it('should delegate to color picker handleColorSelect', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.handleColorSelect('purple=#800080');
      });

      expect(mockHandleColorSelect).toHaveBeenCalledWith('purple=#800080');
    });
  });

  describe('AI task generation methods', () => {
    it('should delegate setAiEnabled to AI hook', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit, enableAI: true }));

      act(() => {
        result.current.setAiEnabled(true);
      });

      expect(mockSetAiEnabled).toHaveBeenCalledWith(true);
    });

    it('should delegate setAiPrompt to AI hook', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit, enableAI: true }));

      act(() => {
        result.current.setAiPrompt('Generate tasks');
      });

      expect(mockSetAiPrompt).toHaveBeenCalledWith('Generate tasks');
    });
  });

  describe('handleSubmit', () => {
    it('should submit form with composed values when valid', async () => {
      mockUseProjectFormState.mockReturnValue(createFormState({ name: 'Valid Project', isValid: true }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

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

    it('should not submit when form is invalid', async () => {
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: false }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit when already submitting', async () => {
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: true }));
      mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should set isSubmitting to true during submission', async () => {
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: true }));
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submitPromise);

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      resolveSubmit!();

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it('should reset form after successful submission', async () => {
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: true }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockFormHandleReset).toHaveBeenCalledTimes(1);
      expect(mockCancelSelect).toHaveBeenCalledTimes(1);
      expect(mockAiHandleReset).toHaveBeenCalledTimes(1);
    });

    it('should log error and set isSubmitting to false on failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Submission failed');
      mockOnSubmit.mockRejectedValueOnce(error);
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: true }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Project submission error:', error);
      expect(result.current.isSubmitting).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should not reset form on submission failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockRejectedValueOnce(new Error('Submission failed'));
      mockUseProjectFormState.mockReturnValue(createFormState({ isValid: true }));

      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockFormHandleReset).not.toHaveBeenCalled();
      expect(mockCancelSelect).toHaveBeenCalledTimes(0);
      expect(mockAiHandleReset).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleReset', () => {
    it('should reset all form state', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.handleReset();
      });

      expect(mockFormHandleReset).toHaveBeenCalledTimes(1);
      expect(mockCancelSelect).toHaveBeenCalledTimes(1);
      expect(mockAiHandleReset).toHaveBeenCalledTimes(1);
    });

    it('should set isSubmitting to false when reset', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('hook API', () => {
    it('should expose all required properties', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(result.current).toHaveProperty('formValues');
      expect(result.current).toHaveProperty('name');
      expect(result.current).toHaveProperty('color');
      expect(result.current).toHaveProperty('aiEnabled');
      expect(result.current).toHaveProperty('aiPrompt');
      expect(result.current).toHaveProperty('colorPickerOpen');
      expect(result.current).toHaveProperty('isSubmitting');
      expect(result.current).toHaveProperty('isValid');
    });

    it('should expose all required methods', () => {
      const { result } = renderHook(() => useProjectFormComposite({ onSubmit: mockOnSubmit }));

      expect(typeof result.current.setName).toBe('function');
      expect(typeof result.current.setColor).toBe('function');
      expect(typeof result.current.setAiEnabled).toBe('function');
      expect(typeof result.current.setAiPrompt).toBe('function');
      expect(typeof result.current.setColorPickerOpen).toBe('function');
      expect(typeof result.current.handleColorSelect).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.handleReset).toBe('function');
    });
  });
});
