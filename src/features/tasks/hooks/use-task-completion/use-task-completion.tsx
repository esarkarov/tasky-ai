import { ToastAction } from '@/shared/components/ui/toast';
import { HTTP_METHODS } from '@/shared/constants/http';
import { ROUTES } from '@/shared/constants/routes';
import { TIMING } from '@/shared/constants/timing';
import { TASK_TOAST_CONTENTS } from '@/shared/constants/ui-contents';
import { useToast } from '@/shared/hooks/use-toast/use-toast';
import { useCallback } from 'react';
import { useFetcher } from 'react-router';
import { UseTaskCompletionParams } from '../../types';

export const useTaskCompletion = ({ enableUndo = true, onSuccess }: UseTaskCompletionParams = {}) => {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const isLoading = fetcher.state !== 'idle';

  const toggleComplete = useCallback(
    async (taskId: string, completed: boolean) => {
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
                onClick={() => toggleComplete(taskId, false)}>
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

        onSuccess?.();
      } catch {
        toast({
          title: TASK_TOAST_CONTENTS.COMPLETE.error,
          description: TASK_TOAST_CONTENTS.COMPLETE.errorDescription,
          duration: TIMING.TOAST_DURATION,
          variant: 'destructive',
        });
      }
    },
    [enableUndo, fetcher, toast, onSuccess]
  );

  return {
    toggleComplete,

    isLoading,
  };
};
