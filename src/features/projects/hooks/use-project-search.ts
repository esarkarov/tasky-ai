import { useProjectSearchResult } from '@/features/projects/types';
import { ROUTES } from '@/shared/constants/routes';
import { TIMING } from '@/shared/constants/timing';
import type { SearchStatus } from '@/shared/types';
import { buildSearchUrl } from '@/shared/utils/operation/operation.utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

export const useProjectSearch = (): useProjectSearchResult => {
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchValueRef = useRef<string>('');
  const navigate = useNavigate();
  const isIdle = searchStatus !== 'idle';
  const isSearching = searchStatus == 'searching';

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = useCallback(
    (searchValue: string) => {
      if (searchValue === lastSearchValueRef.current) {
        return;
      }

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!searchValue) {
        lastSearchValueRef.current = '';
        setSearchStatus('idle');
        navigate(ROUTES.PROJECTS);
        return;
      }

      setSearchStatus('loading');

      searchTimeoutRef.current = setTimeout(() => {
        lastSearchValueRef.current = searchValue;
        setSearchStatus('searching');

        const searchUrl = buildSearchUrl(ROUTES.PROJECTS, searchValue);
        navigate(searchUrl);

        setTimeout(() => setSearchStatus('idle'), 100);
      }, TIMING.DELAY_DURATION);
    },
    [navigate]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearch(e.target.value.trim());
    },
    [handleSearch]
  );

  return {
    handleSearch,
    handleSearchChange,
    isSearching,
    isIdle,
  };
};
