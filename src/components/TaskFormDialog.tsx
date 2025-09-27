import { useState, useEffect, useCallback } from 'react';
import { useLocation, useFetcher } from 'react-router';
import { startOfToday } from 'date-fns';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import type { PropsWithChildren } from 'react';
import { HTTP_METHODS, ROUTES } from '@/constants';
import { ITaskForm } from '@/interfaces';

export const TaskFormDialog: React.FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const location = useLocation();
  const fetcher = useFetcher();

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'q') {
        const target = event.target as HTMLElement;
        if (target.localName === 'textarea') return;

        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  }, []);

  const handleSubmitCreate = useCallback(
    (formData: ITaskForm) => {
      fetcher.submit(JSON.stringify(formData), {
        action: ROUTES.APP,
        method: HTTP_METHODS.POST,
        encType: 'application/json',
      });

      setIsOpen(false);
    },
    [fetcher],
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='p-0 border-0 !rounded-xl'>
        <TaskForm
          defaultFormData={{
            content: '',
            due_date:
              location.pathname === ROUTES.TODAY ? startOfToday() : null,
            projectId: null,
          }}
          mode='create'
          onCancel={() => setIsOpen(false)}
          onSubmit={handleSubmitCreate}
        />
      </DialogContent>
    </Dialog>
  );
};
