import { useDisclosure } from '@/shared/hooks/use-disclosure/use-disclosure';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useDisclosure', () => {
  describe('initial state', () => {
    it('should initialize with isOpen as false', () => {
      const { result } = renderHook(() => useDisclosure());

      expect(result.current.isOpen).toBe(false);
    });

    it('should provide open function', () => {
      const { result } = renderHook(() => useDisclosure());

      expect(typeof result.current.open).toBe('function');
    });

    it('should provide close function', () => {
      const { result } = renderHook(() => useDisclosure());

      expect(typeof result.current.close).toBe('function');
    });

    it('should provide setIsOpen function', () => {
      const { result } = renderHook(() => useDisclosure());

      expect(typeof result.current.setIsOpen).toBe('function');
    });
  });

  describe('open', () => {
    it('should set isOpen to true', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should remain true when called multiple times', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.open();
        result.current.open();
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should maintain stable function reference across renders', () => {
      const { result, rerender } = renderHook(() => useDisclosure());
      const initialOpen = result.current.open;

      rerender();

      expect(result.current.open).toBe(initialOpen);
    });

    it('should maintain stable function reference after state change', () => {
      const { result } = renderHook(() => useDisclosure());
      const initialOpen = result.current.open;

      act(() => {
        result.current.open();
      });

      expect(result.current.open).toBe(initialOpen);
    });
  });

  describe('close', () => {
    it('should set isOpen to false when already open', () => {
      const { result } = renderHook(() => useDisclosure());
      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should remain false when called on closed state', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.close();
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should maintain stable function reference across renders', () => {
      const { result, rerender } = renderHook(() => useDisclosure());
      const initialClose = result.current.close;

      rerender();

      expect(result.current.close).toBe(initialClose);
    });

    it('should maintain stable function reference after state change', () => {
      const { result } = renderHook(() => useDisclosure());
      const initialClose = result.current.close;

      act(() => {
        result.current.close();
      });

      expect(result.current.close).toBe(initialClose);
    });
  });

  describe('setIsOpen', () => {
    it('should set isOpen to true when called with true', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should set isOpen to false when called with false', () => {
      const { result } = renderHook(() => useDisclosure());
      act(() => {
        result.current.setIsOpen(true);
      });

      act(() => {
        result.current.setIsOpen(false);
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should toggle state from false to true to false', () => {
      const { result } = renderHook(() => useDisclosure());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.setIsOpen(true);
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.setIsOpen(false);
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.setIsOpen(true);
      });
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('state transitions', () => {
    it('should handle open-close-open sequence', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);
    });

    it('should handle mixed setIsOpen and method calls', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.setIsOpen(true);
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.setIsOpen(false);
      });
      expect(result.current.isOpen).toBe(false);
    });
  });
});
