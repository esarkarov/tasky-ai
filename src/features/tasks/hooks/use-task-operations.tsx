import { TaskFormInput, UseTaskOperationsParams, UseTaskOperationsResult } from '@/features/tasks/types';
import { ToastAction } from '@/shared/components/ui/toast';
import { HTTP_METHODS } from '@/shared/constants/http';
import { ROUTES } from '@/shared/constants/routes';
import { TIMING } from '@/shared/constants/timing';
import { TASK_TOAST_CONTENTS } from '@/shared/constants/ui-contents';
import { useToast } from '@/shared/hooks/use-toast';
import { buildTaskSuccessDescription, executeWithToast } from '@/shared/utils/operation/operation.utils';
import { useCallback } from 'react';
import { useFetcher } from 'react-router';

export const useTaskOperations = ({
  onSuccess,
  enableUndo = true,
}: UseTaskOperationsParams = {}): UseTaskOperationsResult => {
  const { toast } = useToast();
  const fetcher = useFetcher();

  const isFormBusy = fetcher.state !== 'idle';

  const handleCreateTask = useCallback(
    async (formData: TaskFormInput): Promise<void> => {
      if (!formData) return;

      const operation = () =>
        fetcher.submit(JSON.stringify(formData), {
          action: ROUTES.APP,
          method: HTTP_METHODS.POST,
          encType: 'application/json',
        });

      const description = buildTaskSuccessDescription(formData.content, 'Task created:');

      await executeWithToast(operation, toast, TASK_TOAST_CONTENTS.CREATE, description, onSuccess);
    },
    [toast, onSuccess, fetcher]
  );

  const handleUpdateTask = useCallback(
    async (formData: TaskFormInput, taskId?: string): Promise<void> => {
      if (!taskId && !formData.id) return;

      const operation = () =>
        fetcher.submit(
          JSON.stringify({
            ...formData,
            id: taskId || formData.id,
          }),
          {
            action: ROUTES.APP,
            method: HTTP_METHODS.PUT,
            encType: 'application/json',
          }
        );

      const description = buildTaskSuccessDescription(formData.content, 'Task updated:');

      await executeWithToast(operation, toast, TASK_TOAST_CONTENTS.UPDATE, description, onSuccess);
    },
    [toast, onSuccess, fetcher]
  );

  const toggleTaskComplete = useCallback(
    async (taskId: string, completed: boolean): Promise<void> => {
      if (!taskId) return;

      try {
        await fetcher.submit(JSON.stringify({ id: taskId, completed }), {
          action: ROUTES.APP,
          method: HTTP_METHODS.PUT,
          encType: 'application/json',
        });

        if (completed && enableUndo) {
          toast({
            title: '1 task completed',
            duration: TIMING.TOAST_DURATION,
            className: 'border-l-4 border-[#ea580c]',
            action: (
              <ToastAction
                altText="Undo task completion"
                onClick={() => toggleTaskComplete(taskId, false)}>
                Undo
              </ToastAction>
            ),
          });
        } else {
          toast({
            title: completed ? TASK_TOAST_CONTENTS.COMPLETE.success : TASK_TOAST_CONTENTS.COMPLETE.UNCOMPLETE,
            duration: TIMING.TOAST_DURATION,
            className: 'border-l-4 border-[#ea580c]',
          });
        }
      } catch {
        toast({
          title: TASK_TOAST_CONTENTS.COMPLETE.error,
          description: TASK_TOAST_CONTENTS.COMPLETE.errorDescription,
          duration: TIMING.TOAST_DURATION,
          variant: 'destructive',
        });
      }
    },
    [enableUndo, fetcher, toast]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string): Promise<void> => {
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
    handleCreateTask,
    handleUpdateTask,
    toggleTaskComplete,
    handleDeleteTask,
    fetcher,
    formState: isFormBusy,
  };
};
