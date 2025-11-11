import { INITIAL_COUNT, PAGE_SIZE } from '@/shared/constants/pagination';
import { TIMING } from '@/shared/constants/timing';
import { UseLoadMoreParams, UseLoadMoreResult } from '@/shared/types';
import { CSSProperties, useCallback, useState } from 'react';

export const useLoadMore = <T>(allItems: T[], params: UseLoadMoreParams = {}): UseLoadMoreResult<T> => {
  const { initialCount = INITIAL_COUNT, pageSize = PAGE_SIZE } = params;

  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const items = allItems.slice(0, count);
  const hasMore = count < allItems.length;

  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCount((prev) => prev + pageSize);
      setIsLoading(false);
    }, TIMING.LOAD_DELAY);
  }, [pageSize]);

  const handleReset = useCallback(() => {
    setCount(initialCount);
    setIsLoading(false);
  }, [initialCount]);

  const getItemClassName = useCallback(
    (index: number) => {
      const isNewlyAdded = index >= count - pageSize;
      return isNewlyAdded ? 'animate-in fade-in slide-in-from-bottom-4 duration-300' : 'animate-in fade-in';
    },
    [count, pageSize]
  );

  const getItemStyle = useCallback(
    (index: number): CSSProperties => {
      const isNewlyAdded = index >= count - pageSize;
      return {
        animationDelay: isNewlyAdded ? `${(index - (count - pageSize)) * 0.05}s` : '0s',
      };
    },
    [count, pageSize]
  );

  return {
    items,
    count,
    isLoading,
    hasMore,
    handleLoadMore,
    handleReset,
    getItemClassName,
    getItemStyle,
  };
};
