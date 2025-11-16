import { INITIAL_COUNT, PAGE_SIZE } from '@/shared/constants/pagination';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoadMore } from './use-load-more';

describe('useLoadMore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockItems = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useLoadMore(mockItems));

      expect(result.current.count).toBe(INITIAL_COUNT);
      expect(result.current.items).toHaveLength(INITIAL_COUNT);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasMore).toBe(true);
    });

    it('should initialize with custom initial count', () => {
      const customCount = 5;
      const { result } = renderHook(() => useLoadMore(mockItems, { initialCount: customCount }));

      expect(result.current.count).toBe(customCount);
      expect(result.current.items).toHaveLength(customCount);
    });

    it('should return all items when count exceeds total items', () => {
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

  describe('load more', () => {
    it('should load more items when handleLoadMore is called', async () => {
      const { result } = renderHook(() => useLoadMore(mockItems));

      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.count).toBe(INITIAL_COUNT + PAGE_SIZE);
      expect(result.current.items).toHaveLength(INITIAL_COUNT + PAGE_SIZE);
    });

    it('should use custom page size', async () => {
      const customPageSize = 5;
      const { result } = renderHook(() => useLoadMore(mockItems, { pageSize: customPageSize }));

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.count).toBe(INITIAL_COUNT + customPageSize);
    });

    it('should handle multiple load more calls', async () => {
      const { result } = renderHook(() => useLoadMore(mockItems));

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.count).toBe(INITIAL_COUNT + PAGE_SIZE);

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.count).toBe(INITIAL_COUNT + PAGE_SIZE * 2);
    });

    it('should update hasMore correctly', async () => {
      const smallList = Array.from({ length: 15 }, (_, i) => ({ id: i }));
      const { result } = renderHook(() => useLoadMore(smallList, { initialCount: 10, pageSize: 5 }));

      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset count to initial value', async () => {
      const { result } = renderHook(() => useLoadMore(mockItems));

      act(() => {
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.count).toBe(INITIAL_COUNT + PAGE_SIZE);

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.count).toBe(INITIAL_COUNT);
      expect(result.current.items).toHaveLength(INITIAL_COUNT);
      expect(result.current.isLoading).toBe(false);
    });

    it('should reset to custom initial count', async () => {
      const customCount = 5;
      const { result } = renderHook(() => useLoadMore(mockItems, { initialCount: customCount }));

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

    it('should cancel loading state on reset', () => {
      const { result } = renderHook(() => useLoadMore(mockItems));

      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('edge cases', () => {
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

    it('should handle rapid successive calls', async () => {
      const { result } = renderHook(() => useLoadMore(mockItems));

      act(() => {
        result.current.handleLoadMore();
        result.current.handleLoadMore();
        result.current.handleLoadMore();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useLoadMore(mockItems));

      const initialHandleLoadMore = result.current.handleLoadMore;
      const initialHandleReset = result.current.handleReset;
      const initialGetItemClassName = result.current.getItemClassName;
      const initialGetItemStyle = result.current.getItemStyle;

      rerender();

      expect(result.current.handleLoadMore).toBe(initialHandleLoadMore);
      expect(result.current.handleReset).toBe(initialHandleReset);
      expect(result.current.getItemClassName).toBe(initialGetItemClassName);
      expect(result.current.getItemStyle).toBe(initialGetItemStyle);
    });
  });
});
