import { useAITaskGeneration } from '@/features/ai/hooks/use-ai-task-generations';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useAITaskGeneration', () => {
  describe('Initialization', () => {
    it('should initialize with AI disabled by default', () => {
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
      expect(result.current.aiPrompt).toBe('');
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('AI Toggle', () => {
    it('should toggle AI from disabled to enabled', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(true);
    });

    it('should toggle AI from enabled to disabled', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(false);
    });

    it('should toggle AI multiple times', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.toggleAI();
      });
      expect(result.current.aiEnabled).toBe(true);

      act(() => {
        result.current.toggleAI();
      });
      expect(result.current.aiEnabled).toBe(false);

      act(() => {
        result.current.toggleAI();
      });
      expect(result.current.aiEnabled).toBe(true);
    });
  });

  describe('AI Enabled State', () => {
    it('should enable AI', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiEnabled(true);
      });

      expect(result.current.aiEnabled).toBe(true);
    });

    it('should disable AI', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.setAiEnabled(false);
      });

      expect(result.current.aiEnabled).toBe(false);
    });
  });

  describe('AI Prompt Management', () => {
    it('should update AI prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiPrompt('Generate shopping list tasks');
      });

      expect(result.current.aiPrompt).toBe('Generate shopping list tasks');
    });

    it('should handle empty prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiPrompt('Initial prompt');
      });

      act(() => {
        result.current.setAiPrompt('');
      });

      expect(result.current.aiPrompt).toBe('');
    });

    it('should handle whitespace-only prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiPrompt('   \n  \t  ');
      });

      expect(result.current.aiPrompt).toBe('   \n  \t  ');
    });
  });

  describe('Validation Logic', () => {
    it('should be valid when AI is disabled', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.isValid).toBe(true);
    });

    it('should be valid when AI is disabled regardless of prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiPrompt('');
      });

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.isValid).toBe(true);
    });

    it('should be invalid when AI is enabled with empty prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      expect(result.current.aiEnabled).toBe(true);
      expect(result.current.aiPrompt).toBe('');
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

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.setAiEnabled(true);
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should become valid when adding prompt to enabled AI', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setAiPrompt('My prompt');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should become valid when disabling AI with empty prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setAiEnabled(false);
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to default state', () => {
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

    it('should reset when initialized with enabled true', () => {
      const { result } = renderHook(() => useAITaskGeneration({ enabled: true }));

      act(() => {
        result.current.setAiPrompt('Some prompt');
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.aiPrompt).toBe('');
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Combined State Changes', () => {
    it('should handle enabling AI and adding prompt', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiEnabled(true);
        result.current.setAiPrompt('Create workout tasks');
      });

      expect(result.current.aiEnabled).toBe(true);
      expect(result.current.aiPrompt).toBe('Create workout tasks');
      expect(result.current.isValid).toBe(true);
    });

    it('should handle toggling AI while prompt exists', () => {
      const { result } = renderHook(() => useAITaskGeneration());

      act(() => {
        result.current.setAiPrompt('My prompt');
      });

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(true);
      expect(result.current.aiPrompt).toBe('My prompt');
      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.toggleAI();
      });

      expect(result.current.aiEnabled).toBe(false);
      expect(result.current.aiPrompt).toBe('My prompt');
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Exposed API', () => {
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
  });
});
