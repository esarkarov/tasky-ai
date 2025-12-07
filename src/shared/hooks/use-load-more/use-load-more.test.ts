import { INITIAL_COUNT, PAGE_SIZE, useLoadMore } from '@/shared/hooks/use-load-more/use-load-more';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useLoadMore', () => {
  const MOCK_ITEMS = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with default count', () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      expect(result.current.count).toBe(INITIAL_COUNT);
    });

    it('should initialize with default items length', () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      expect(result.current.items).toHaveLength(INITIAL_COUNT);
    });

    it('should initialize with loading as false', () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      expect(result.current.isLoading).toBe(false);
    });

    it('should initialize with hasMore as true when items exceed count', () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      expect(result.current.hasMore).toBe(true);
    });

    it('should use custom initial count when provided', () => {
      const customCount = 5;

      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS, { initialCount: customCount }));

      expect(result.current.count).toBe(customCount);
      expect(result.current.items).toHaveLength(customCount);
    });

    it('should set hasMore to false when items are less than initial count', () => {
      const smallList = [{ id: 1 }, { id: 2 }];

      const { result } = renderHook(() => useLoadMore(smallList));

      expect(result.current.items).toHaveLength(2);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => useLoadMore([]));

      expect(result.current.items).toHaveLength(0);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('handleLoadMore', () => {
    it('should set loading state to true immediately', () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should increase count by page size after delay', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.count).toBe(INITIAL_COUNT + PAGE_SIZE);
    });

    it('should increase items length by page size after delay', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.items).toHaveLength(INITIAL_COUNT + PAGE_SIZE);
    });

    it('should set loading state to false after delay', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should use custom page size when provided', async () => {
      const customPageSize = 7;
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS, { pageSize: customPageSize }));

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.count).toBe(INITIAL_COUNT + customPageSize);
    });

    it('should handle multiple consecutive loads', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.count).toBe(INITIAL_COUNT + PAGE_SIZE * 2);
    });

    it('should set hasMore to false when all items are loaded', async () => {
      const smallList = Array.from({ length: 15 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => useLoadMore(smallList, { initialCount: 10, pageSize: 5 }));

      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('should not exceed total items length', async () => {
      const smallList = Array.from({ length: 12 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => useLoadMore(smallList, { initialCount: 5, pageSize: 10 }));

      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.items).toHaveLength(12);
      expect(result.current.count).toBe(15);
      expect(result.current.hasMore).toBe(false);
    });

    it('should maintain stable function reference across renders', () => {
      const { result, rerender } = renderHook(() => useLoadMore(MOCK_ITEMS));
      const initialFunction = result.current.handleLoadMore;

      rerender();

      expect(result.current.handleLoadMore).toBe(initialFunction);
    });
  });

  describe('handleReset', () => {
    it('should reset count to initial value', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));
      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.count).toBe(INITIAL_COUNT);
    });

    it('should reset items to initial length', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));
      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.items).toHaveLength(INITIAL_COUNT);
    });

    it('should reset loading state to false', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));
      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should reset to custom initial count when provided', async () => {
      const customCount = 5;
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS, { initialCount: customCount }));
      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.count).toBe(customCount);
    });

    it('should cancel loading state when called during load', () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));
      act(() => {
        result.current.handleLoadMore();
      });
      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should maintain stable function reference across renders', () => {
      const { result, rerender } = renderHook(() => useLoadMore(MOCK_ITEMS));
      const initialFunction = result.current.handleReset;

      rerender();

      expect(result.current.handleReset).toBe(initialFunction);
    });
  });

  describe('getItemClassName', () => {
    it('should return animation class for newly added items', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));
      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      const className = result.current.getItemClassName(INITIAL_COUNT);

      expect(className).toContain('animate-in fade-in slide-in-from-bottom-4');
    });

    it('should return basic animation class for existing items', () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      const className = result.current.getItemClassName(0);

      expect(className).toBe('animate-in fade-in');
    });

    it('should maintain stable function reference across renders', () => {
      const { result, rerender } = renderHook(() => useLoadMore(MOCK_ITEMS));
      const initialFunction = result.current.getItemClassName;

      rerender();

      expect(result.current.getItemClassName).toBe(initialFunction);
    });
  });

  describe('getItemStyle', () => {
    it('should return animation delay for newly added items', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));
      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      const style = result.current.getItemStyle(INITIAL_COUNT);

      expect(style.animationDelay).toBe('0s');
    });

    it('should return zero delay for existing items', () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));

      const style = result.current.getItemStyle(0);

      expect(style.animationDelay).toBe('0s');
    });

    it('should calculate staggered delay for multiple new items', async () => {
      const { result } = renderHook(() => useLoadMore(MOCK_ITEMS));
      act(() => {
        result.current.handleLoadMore();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      const style1 = result.current.getItemStyle(INITIAL_COUNT);
      const style2 = result.current.getItemStyle(INITIAL_COUNT + 1);

      expect(style1.animationDelay).toBe('0s');
      expect(style2.animationDelay).toBe('0.05s');
    });

    it('should maintain stable function reference across renders', () => {
      const { result, rerender } = renderHook(() => useLoadMore(MOCK_ITEMS));
      const initialFunction = result.current.getItemStyle;

      rerender();

      expect(result.current.getItemStyle).toBe(initialFunction);
    });
  });
});
