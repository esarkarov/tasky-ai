import type { ProjectFormInput, UseProjectMutationOptions, UseProjectMutationResult } from '@/features/projects/types';
import { HTTP_METHODS } from '@/shared/constants/http';
import { ROUTES } from '@/shared/constants/routes';
import { PROJECT_TOAST_CONTENTS } from '@/shared/constants/ui-contents';
import { useToast } from '@/shared/hooks/use-toast';
import { executeWithToast } from '@/shared/utils/operation/operation.utils';
import { useFetcher } from 'react-router';

export const useProjectMutation = (options?: UseProjectMutationOptions): UseProjectMutationResult => {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const isLoading = fetcher.state !== 'idle';

  const createProject = async (data: ProjectFormInput) => {
    const operation = () =>
      fetcher.submit(JSON.stringify(data), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.POST,
        encType: 'application/json',
      });

    const description = data.ai_task_gen
      ? `Project "${data.name}" created with AI-generated tasks`
      : `Project "${data.name}" created successfully`;

    await executeWithToast(operation, toast, PROJECT_TOAST_CONTENTS.CREATE, description, options?.onSuccess);
  };
  const updateProject = async (data: ProjectFormInput) => {
    const operation = () =>
      fetcher.submit(JSON.stringify(data), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.PUT,
        encType: 'application/json',
      });

    const description = `Project "${data.name}" updated successfully`;

    await executeWithToast(operation, toast, PROJECT_TOAST_CONTENTS.UPDATE, description, options?.onSuccess);
  };
  const deleteProject = async (id: string, name: string) => {
    const operation = () =>
      fetcher.submit(JSON.stringify({ id }), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.DELETE,
        encType: 'application/json',
      });

    const description = `Project "${name}" deleted successfully`;

    await executeWithToast(operation, toast, PROJECT_TOAST_CONTENTS.DELETE, description, options?.onSuccess);
  };

  return {
    createProject,
    updateProject,
    deleteProject,
    isLoading,
  };
};
