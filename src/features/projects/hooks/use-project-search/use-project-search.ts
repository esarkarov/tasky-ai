import { ROUTES, TIMING } from '@/shared/constants';
import type { SearchStatus } from '@/shared/types';
import { buildSearchUrl } from '@/shared/utils/operation/operation.utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

export const useProjectSearch = () => {
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

  const searchProjects = useCallback(
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
      searchProjects(e.target.value.trim());
    },
    [searchProjects]
  );

  return {
    searchProjects,
    handleSearchChange,

    isSearching,
    isIdle,
  };
};
