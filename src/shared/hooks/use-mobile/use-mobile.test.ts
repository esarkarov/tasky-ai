import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let listeners: Array<() => void> = [];

  beforeEach(() => {
    listeners = [];
    mockMatchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_: string, handler: () => void) => {
        listeners.push(handler);
      }),
      removeEventListener: vi.fn((_: string, handler: () => void) => {
        listeners = listeners.filter((l) => l !== handler);
      }),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.clearAllMocks();
  });

  describe('initial detection', () => {
    it('should detect mobile when width is below 768px', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should detect desktop when width is 768px or above', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should detect desktop at exactly 768px', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should detect mobile at 767px', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      });

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('resize handling', () => {
    it('should update when window is resized from desktop to mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      listeners.forEach((listener) => listener());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should update when window is resized from mobile to desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      listeners.forEach((listener) => listener());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('media query', () => {
    it('should set up matchMedia with correct breakpoint', () => {
      renderHook(() => useIsMobile());

      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    });

    it('should register change event listener', () => {
      renderHook(() => useIsMobile());

      expect(listeners).toHaveLength(1);
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useIsMobile());

      expect(listeners).toHaveLength(1);

      unmount();

      expect(listeners).toHaveLength(0);
    });

    it('should handle multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = renderHook(() => useIsMobile());
      expect(listeners).toHaveLength(1);

      const { unmount: unmount2 } = renderHook(() => useIsMobile());
      expect(listeners).toHaveLength(2);

      unmount1();
      expect(listeners).toHaveLength(1);

      unmount2();
      expect(listeners).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very small viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle very large viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 2560,
      });

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });
});
