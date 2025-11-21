import type { ProjectFormInput } from '@/features/projects/types';
import { HTTP_METHODS, ROUTES } from '@/shared/constants';
import { useToast } from '@/shared/hooks/use-toast/use-toast';
import { executeWithToast } from '@/shared/utils/operation/operation.utils';
import { useFetcher } from 'react-router';

const PROJECT_TOAST_CONTENTS = {
  CREATE: {
    loading: 'Creating project...',
    success: 'Project created!',
    error: 'Error creating project!',
    errorDescription: 'An error occurred while creating the project!',
  },
  UPDATE: {
    loading: 'Updating project...',
    success: 'Project updated!',
    error: 'Error updating project!',
    errorDescription: 'An error occurred while updating the project!',
  },
  DELETE: {
    loading: 'Deleting project...',
    success: 'Project deleted!',
    error: 'Error deleting project!',
    errorDescription: 'An error occurred while deleting the project!',
  },
};
export interface UseProjectMutationParams {
  onSuccess?: () => void;
}

export const useProjectMutation = ({ onSuccess }: UseProjectMutationParams = {}) => {
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

    await executeWithToast(operation, toast, PROJECT_TOAST_CONTENTS.CREATE, description, onSuccess);
  };
  const updateProject = async (data: ProjectFormInput) => {
    const operation = () =>
      fetcher.submit(JSON.stringify(data), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.PUT,
        encType: 'application/json',
      });

    const description = `Project "${data.name}" updated successfully`;

    await executeWithToast(operation, toast, PROJECT_TOAST_CONTENTS.UPDATE, description, onSuccess);
  };
  const deleteProject = async (id: string, name: string) => {
    const operation = () =>
      fetcher.submit(JSON.stringify({ id }), {
        action: ROUTES.PROJECTS,
        method: HTTP_METHODS.DELETE,
        encType: 'application/json',
      });

    const description = `Project "${name}" deleted successfully`;

    await executeWithToast(operation, toast, PROJECT_TOAST_CONTENTS.DELETE, description, onSuccess);
  };

  return {
    createProject,
    updateProject,
    deleteProject,

    isLoading,
  };
};
