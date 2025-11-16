import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDisclosure } from './use-disclosure';

describe('useDisclosure', () => {
  describe('initial state', () => {
    it('should start with isOpen as false', () => {
      const { result } = renderHook(() => useDisclosure());

      expect(result.current.isOpen).toBe(false);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useDisclosure());

      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.setIsOpen).toBe('function');
    });
  });

  describe('opening', () => {
    it('should set isOpen to true when open is called', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should remain true when open is called multiple times', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.open();
        result.current.open();
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('closing', () => {
    it('should set isOpen to false when close is called', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should remain false when close is called multiple times', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.close();
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
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

    it('should toggle state multiple times', () => {
      const { result } = renderHook(() => useDisclosure());

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
    it('should handle open -> close -> open sequence', () => {
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

    it('should handle mixed setIsOpen and open/close calls', () => {
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

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useDisclosure());

      const initialOpen = result.current.open;
      const initialClose = result.current.close;

      rerender();

      expect(result.current.open).toBe(initialOpen);
      expect(result.current.close).toBe(initialClose);
    });

    it('should maintain stable function references after state changes', () => {
      const { result } = renderHook(() => useDisclosure());

      const initialOpen = result.current.open;
      const initialClose = result.current.close;

      act(() => {
        result.current.open();
      });

      expect(result.current.open).toBe(initialOpen);
      expect(result.current.close).toBe(initialClose);
    });
  });
});
