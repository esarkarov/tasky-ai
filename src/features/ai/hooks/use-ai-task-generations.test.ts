import { useAITaskGeneration } from '@/features/ai/hooks/use-ai-task-generations';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useAITaskGeneration', () => {
  describe('initialization', () => {
    it('should initialize with AI disabled and valid state by default', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.aiPrompt).toBe('');
      expect(result.current.isValid).toBe(true);
    });

    it('should initialize with AI enabled when specified', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      expect(result.current.aiEnabled).toBe(true);
      expect(result.current.aiPrompt).toBe('');
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('AI toggle', () => {
    it('should enable AI when setAiEnabled is called with true', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiEnabled(true);
      });

      expect(result.current.aiEnabled).toBe(true);
    });

    it('should disable AI when setAiEnabled is called with false', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.setAiEnabled(false);
      });

      expect(result.current.aiEnabled).toBe(false);
    });

    it('should toggle AI state when toggleAI is called', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(true);

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(false);
    });

    it('should preserve prompt when toggling AI state', () => {
      const { result } = renderHook(() => useAITaskGeneration());
      const testPrompt = 'Test prompt';

      act(() => {
        result.current.setAiPrompt(testPrompt);
        result.current.toggleAI();
      });

      expect(result.current.aiPrompt).toBe(testPrompt);
    });
  });

  describe('prompt management', () => {
    it('should update prompt when setAiPrompt is called', () => {
      const { result } = renderHook(() => useAITaskGeneration());
      const testPrompt = 'Generate shopping list tasks';

      act(() => {
        result.current.setAiPrompt(testPrompt);
      });

      expect(result.current.aiPrompt).toBe(testPrompt);
    });

    it('should accept empty string prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiPrompt('Initial prompt');
        result.current.setAiPrompt('');
      });

      expect(result.current.aiPrompt).toBe('');
    });

    it('should accept whitespace-only prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());
      const whitespacePrompt = '   \n  \t  ';

      act(() => {
        result.current.setAiPrompt(whitespacePrompt);
      });

      expect(result.current.aiPrompt).toBe(whitespacePrompt);
    });
  });

  describe('validation', () => {
    it('should be valid when AI is disabled regardless of prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiPrompt('');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should be invalid when AI is enabled with empty or whitespace prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setAiPrompt('   ');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should be valid when AI is enabled with non-empty prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.setAiPrompt('Generate tasks');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should update validation when AI state changes', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiEnabled(true);
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setAiPrompt('My prompt');
      });

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.setAiEnabled(false);
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to default state when handleReset is called', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.setAiPrompt('Some prompt');
        result.current.handleReset();
      });

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.aiPrompt).toBe('');
      expect(result.current.isValid).toBe(true);
    });
  });
});
