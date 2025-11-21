import { TIMING } from '@/shared/constants';
import { buildSearchUrl } from '@/shared/utils/operation/operation.utils';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectSearch } from './use-project-search';

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/shared/utils/operation/operation.utils', () => ({
  buildSearchUrl: vi.fn((route: string, searchValue: string) => `${route}?search=${encodeURIComponent(searchValue)}`),
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    PROJECTS: '/projects',
  },
  TIMING: {
    DELAY_DURATION: 300,
  },
}));

describe('useProjectSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with idle status', () => {
      const { result } = renderHook(() => useProjectSearch());

      expect(result.current.isSearching).toBe(false);
      expect(result.current.isIdle).toBe(false);
    });
  });

  describe('searchProjects', () => {
    it('should handle search with debounce', async () => {
      const { result } = renderHook(() => useProjectSearch());

      act(() => {
        result.current.searchProjects('test query');
      });

      expect(result.current.isSearching).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(TIMING.DELAY_DURATION);
      });

      expect(result.current.isSearching).toBe(true);
      expect(buildSearchUrl).toHaveBeenCalledWith('/projects', 'test query');
      expect(mockNavigate).toHaveBeenCalledWith(`${'/projects'}?search=test%20query`);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isSearching).toBe(false);
    });

    it('should cancel previous search when new search is triggered', async () => {
      const { result } = renderHook(() => useProjectSearch());

      act(() => {
        result.current.searchProjects('first');
      });

      act(() => {
        vi.advanceTimersByTime(TIMING.DELAY_DURATION / 2);
      });

      act(() => {
        result.current.searchProjects('second');
      });

      await act(async () => {
        vi.advanceTimersByTime(TIMING.DELAY_DURATION);
      });

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(buildSearchUrl).toHaveBeenCalledWith('/projects', 'second');
    });

    it('should not search if value is the same as last search', async () => {
      const { result } = renderHook(() => useProjectSearch());

      act(() => {
        result.current.searchProjects('same query');
      });

      await act(async () => {
        vi.advanceTimersByTime(TIMING.DELAY_DURATION + 100);
      });

      mockNavigate.mockClear();
      vi.clearAllMocks();

      act(() => {
        result.current.searchProjects('same query');
      });

      await act(async () => {
        vi.advanceTimersByTime(TIMING.DELAY_DURATION);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should cleanup timeout on unmount', () => {
      const { result, unmount } = renderHook(() => useProjectSearch());

      act(() => {
        result.current.searchProjects('test');
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(TIMING.DELAY_DURATION);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('handleSearchChange', () => {
    it('should handle search change event', async () => {
      const { result } = renderHook(() => useProjectSearch());

      const mockEvent = {
        target: { value: '  search term  ' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleSearchChange(mockEvent);
      });

      await act(async () => {
        vi.advanceTimersByTime(TIMING.DELAY_DURATION);
      });

      expect(buildSearchUrl).toHaveBeenCalledWith('/projects', 'search term');
    });
  });

  describe('status transitions', () => {
    it('should update status correctly through search lifecycle', async () => {
      const { result } = renderHook(() => useProjectSearch());

      expect(result.current.isSearching).toBe(false);
      expect(result.current.isIdle).toBe(false);

      act(() => {
        result.current.searchProjects('query');
      });

      expect(result.current.isSearching).toBe(false);
      expect(result.current.isIdle).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(TIMING.DELAY_DURATION);
      });

      expect(result.current.isSearching).toBe(true);
      expect(result.current.isIdle).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isSearching).toBe(false);
      expect(result.current.isIdle).toBe(false);
    });
  });
});
