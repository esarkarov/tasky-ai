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

    it('should initialize with AI disabled when explicitly set to false', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: false }));

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('setAiEnabled', () => {
    it('should enable AI when called with true', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiEnabled(true);
      });

      expect(result.current.aiEnabled).toBe(true);
    });

    it('should disable AI when called with false', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.setAiEnabled(false);
      });

      expect(result.current.aiEnabled).toBe(false);
    });
  });

  describe('toggleAI', () => {
    it('should toggle AI state from disabled to enabled', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(true);
    });

    it('should toggle AI state from enabled to disabled', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(false);
    });

    it('should toggle AI state multiple times correctly', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.toggleAI();
        result.current.toggleAI();
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(true);
    });

    it('should preserve prompt when toggling AI state', () => {
      const { result } = renderHook(() => useAITaskGeneration());
      const testPrompt = 'Test prompt';

      act(() => {
        result.current.setAiPrompt(testPrompt);
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(true);
      expect(result.current.aiPrompt).toBe(testPrompt);

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.aiPrompt).toBe(testPrompt);
    });
  });

  describe('setAiPrompt', () => {
    it('should update prompt with non-empty value', () => {
      const { result } = renderHook(() => useAITaskGeneration());
      const testPrompt = 'Generate shopping list tasks';

      act(() => {
        result.current.setAiPrompt(testPrompt);
      });

      expect(result.current.aiPrompt).toBe(testPrompt);
    });

    it('should update prompt to empty string', () => {
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
    it('should be valid when AI is disabled regardless of prompt state', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.setAiPrompt('');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should be invalid when AI is enabled with empty prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      expect(result.current.isValid).toBe(false);
    });

    it('should be invalid when AI is enabled with whitespace-only prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

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

    it('should become invalid when enabling AI without prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiEnabled(true);
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should become valid when adding prompt after AI is enabled', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setAiPrompt('My prompt');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should become valid when disabling AI with empty prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.setAiEnabled(false);
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('handleReset', () => {
    it('should reset to default state when AI was enabled with prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiEnabled(true);
        result.current.setAiPrompt('Some prompt');
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.aiPrompt).toBe('');
      expect(result.current.isValid).toBe(true);
    });

    it('should reset to default state when initialized with enabled true', () => {
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

  describe('combined operations', () => {
    it('should maintain valid state when enabling AI and adding prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiEnabled(true);
        result.current.setAiPrompt('Create workout tasks');
      });

      expect(result.current.aiEnabled).toBe(true);
      expect(result.current.aiPrompt).toBe('Create workout tasks');
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('hook API', () => {
    it('should expose all required properties and methods', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      expect(result.current).toHaveProperty('aiEnabled');
      expect(result.current).toHaveProperty('aiPrompt');
      expect(result.current).toHaveProperty('isValid');
      expect(result.current).toHaveProperty('setAiEnabled');
      expect(result.current).toHaveProperty('setAiPrompt');
      expect(result.current).toHaveProperty('handleReset');
      expect(result.current).toHaveProperty('toggleAI');
    });

    it('should have correct method types', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      expect(typeof result.current.setAiEnabled).toBe('function');
      expect(typeof result.current.setAiPrompt).toBe('function');
      expect(typeof result.current.handleReset).toBe('function');
      expect(typeof result.current.toggleAI).toBe('function');
      expect(typeof result.current.aiEnabled).toBe('boolean');
      expect(typeof result.current.aiPrompt).toBe('string');
      expect(typeof result.current.isValid).toBe('boolean');
    });
  });
});
