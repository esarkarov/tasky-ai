export interface UseLoadMoreParams {
  initialCount?: number;
  pageSize?: number;
}

export interface UseLoadMoreResult<T> {
  items: T[];
  count: number;
  isLoading: boolean;
  hasMore: boolean;
  handleLoadMore: () => void;
  handleReset: () => void;
  getItemClassName: (index: number) => string;
  getItemStyle: (index: number) => React.CSSProperties;
}

export interface UseDisclosureResult {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  open: () => void;
  close: () => void;
}
