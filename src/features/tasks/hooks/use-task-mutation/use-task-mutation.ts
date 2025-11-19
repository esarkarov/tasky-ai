import { TASK_TOAST_CONTENTS } from '@/features/tasks/constants';
import { TaskFormInput } from '@/features/tasks/types';
import { HTTP_METHODS } from '@/shared/constants/http';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/shared/hooks/use-toast/use-toast';
import { buildTaskSuccessDescription, executeWithToast } from '@/shared/utils/operation/operation.utils';
import { useCallback } from 'react';
import { useFetcher } from 'react-router';
export interface UseTaskMutationParams {
  onSuccess?: () => void;
}

export const useTaskMutation = ({ onSuccess }: UseTaskMutationParams = {}) => {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const isLoading = fetcher.state !== 'idle';

  const handleCreate = useCallback(
    async (data: TaskFormInput) => {
      if (!data) return;

      const operation = () =>
        fetcher.submit(JSON.stringify(data), {
          action: ROUTES.APP,
          method: HTTP_METHODS.POST,
          encType: 'application/json',
        });

      const description = buildTaskSuccessDescription(data.content, 'Task created:');

      await executeWithToast(operation, toast, TASK_TOAST_CONTENTS.CREATE, description, onSuccess);
    },
    [fetcher, toast, onSuccess]
  );
  const handleUpdate = useCallback(
    async (data: TaskFormInput, taskId?: string) => {
      const id = taskId || data.id;
      if (!id) return;

      const operation = () =>
        fetcher.submit(JSON.stringify({ ...data, id }), {
          action: ROUTES.APP,
          method: HTTP_METHODS.PUT,
          encType: 'application/json',
        });

      const description = buildTaskSuccessDescription(data.content, 'Task updated:');

      await executeWithToast(operation, toast, TASK_TOAST_CONTENTS.UPDATE, description, onSuccess);
    },
    [fetcher, toast, onSuccess]
  );
  const handleDelete = useCallback(
    async (taskId: string) => {
      if (!taskId) return;

      const operation = () =>
        fetcher.submit(JSON.stringify({ id: taskId }), {
          action: ROUTES.APP,
          method: HTTP_METHODS.DELETE,
          encType: 'application/json',
        });

      await executeWithToast(
        operation,
        toast,
        TASK_TOAST_CONTENTS.DELETE,
        TASK_TOAST_CONTENTS.DELETE.successDescription
      );
    },
    [fetcher, toast]
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,

    isLoading,
  };
};
