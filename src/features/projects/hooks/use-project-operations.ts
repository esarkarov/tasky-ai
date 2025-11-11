import { ProjectFormInput, UseProjectOperationsParams, UseProjectOperationsResult } from '@/features/projects/types';
import { HTTP_METHODS } from '@/shared/constants/http';
import { ROUTES } from '@/shared/constants/routes';
import { TIMING } from '@/shared/constants/timing';
import { PROJECT_TOAST_CONTENTS } from '@/shared/constants/ui-contents';
import { MAX_PROJECT_NAME_TRUNCATE_LENGTH } from '@/shared/constants/validation';
import { useToast } from '@/shared/hooks/use-toast';
import { SearchStatus } from '@/shared/types';
import {
  buildProjectSuccessDescription,
  buildSearchUrl,
  executeWithToast,
} from '@/shared/utils/operation/operation.utils';
import { truncateString } from '@/shared/utils/text/text.utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useLocation, useNavigate, useNavigation } from 'react-router';

export const useProjectOperations = ({
  method = 'POST',
  projectData,
  onSuccess,
}: UseProjectOperationsParams = {}): UseProjectOperationsResult => {
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSearchValueRef = useRef<string>('');

  const { state, location } = useNavigation();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const isFormBusy = fetcher.state !== 'idle';
  const isViewingCurrentProject = pathname === ROUTES.PROJECT(projectData?.id as string);
  const isNavigatingToProjects = state === 'loading' && location?.pathname === ROUTES.PROJECTS;

  const operationMessages = useMemo(
    () => (method === 'POST' ? PROJECT_TOAST_CONTENTS.CREATE : PROJECT_TOAST_CONTENTS.UPDATE),
    [method]
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSaveProject = useCallback(
    async (formData: ProjectFormInput): Promise<void> => {
      if (!formData) return;

      const operation = () =>
        fetcher.submit(JSON.stringify(formData), {
          action: ROUTES.PROJECTS,
          method,
          encType: 'application/json',
        });

      const description = buildProjectSuccessDescription(formData.name, formData.ai_task_gen, method);

      await executeWithToast(operation, toast, operationMessages, description, onSuccess);
    },
    [fetcher, method, operationMessages, toast, onSuccess]
  );

  const handleDeleteProject = useCallback(async (): Promise<void> => {
    if (!projectData) return;

    if (isViewingCurrentProject) {
      navigate(ROUTES.INBOX);
    }

    const operation = () =>
      fetcher.submit(JSON.stringify(projectData), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.DELETE,
        encType: 'application/json',
      });

    const description = `The project ${truncateString(projectData.name, MAX_PROJECT_NAME_TRUNCATE_LENGTH)} has been successfully deleted.`;

    await executeWithToast(operation, toast, PROJECT_TOAST_CONTENTS.DELETE, description, onSuccess);
  }, [projectData, isViewingCurrentProject, navigate, fetcher, toast, onSuccess]);

  const handleSearchProjects = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const searchValue = e.target.value.trim();

      if (searchValue === lastSearchValueRef.current) {
        return;
      }

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!searchValue) {
        lastSearchValueRef.current = '';
        setSearchStatus('idle');
        navigate(ROUTES.PROJECTS);
        return;
      }

      setSearchStatus('loading');
      searchTimeoutRef.current = setTimeout(() => {
        abortControllerRef.current = new AbortController();
        lastSearchValueRef.current = searchValue;
        setSearchStatus('searching');

        try {
          navigate(buildSearchUrl(ROUTES.PROJECTS, searchValue));
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Search navigation error:', error);
          }
        } finally {
          setTimeout(() => {
            setSearchStatus('idle');
            abortControllerRef.current = null;
          }, 100);
        }
      }, TIMING.DELAY_DURATION);
    },
    [navigate]
  );

  return {
    handleSaveProject,
    handleDeleteProject,
    handleSearchProjects,
    fetcher,
    formState: isFormBusy,
    searchStatus: isNavigatingToProjects ? 'searching' : searchStatus,
  };
};
