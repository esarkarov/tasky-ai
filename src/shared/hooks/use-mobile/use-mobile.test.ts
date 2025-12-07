import { MOBILE_BREAKPOINT, useIsMobile } from '@/shared/hooks/use-mobile/use-mobile';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useIsMobile', () => {
  const ORIGINAL_INNER_WIDTH = window.innerWidth;

  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let changeListeners: Array<() => void> = [];

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  const triggerResize = () => {
    changeListeners.forEach((listener) => listener());
  };

  beforeEach(() => {
    changeListeners = [];

    mockMatchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event: string, handler: () => void) => {
        changeListeners.push(handler);
      }),
      removeEventListener: vi.fn((_event: string, handler: () => void) => {
        changeListeners = changeListeners.filter((l) => l !== handler);
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
    setWindowWidth(ORIGINAL_INNER_WIDTH);
    vi.clearAllMocks();
  });

  describe('initial detection', () => {
    it('should return true when width is below breakpoint', async () => {
      setWindowWidth(500);

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should return false when width is at breakpoint', async () => {
      setWindowWidth(MOBILE_BREAKPOINT);

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should return false when width is above breakpoint', async () => {
      setWindowWidth(1024);

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should return true when width is one pixel below breakpoint', async () => {
      setWindowWidth(MOBILE_BREAKPOINT - 1);

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should return true for very small viewport', async () => {
      setWindowWidth(320);

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should return false for very large viewport', async () => {
      setWindowWidth(2560);

      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('window resize', () => {
    it('should update to true when resized from desktop to mobile', async () => {
      setWindowWidth(1024);
      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });

      setWindowWidth(500);
      triggerResize();

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should update to false when resized from mobile to desktop', async () => {
      setWindowWidth(500);
      const { result } = renderHook(() => useIsMobile());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      setWindowWidth(1024);
      triggerResize();

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('matchMedia setup', () => {
    it('should call matchMedia with correct breakpoint query', () => {
      renderHook(() => useIsMobile());

      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
      expect(mockMatchMedia).toHaveBeenCalledOnce();
    });

    it('should register change event listener on mount', () => {
      renderHook(() => useIsMobile());

      expect(changeListeners).toHaveLength(1);
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useIsMobile());
      expect(changeListeners).toHaveLength(1);

      unmount();

      expect(changeListeners).toHaveLength(0);
    });

    it('should handle multiple hooks mounting simultaneously', () => {
      const { unmount: unmount1 } = renderHook(() => useIsMobile());
      const { unmount: unmount2 } = renderHook(() => useIsMobile());

      expect(changeListeners).toHaveLength(2);

      unmount1();

      expect(changeListeners).toHaveLength(1);

      unmount2();

      expect(changeListeners).toHaveLength(0);
    });
  });
});
