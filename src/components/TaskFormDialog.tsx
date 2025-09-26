import { useState, useEffect } from 'react';
import { useLocation, useFetcher } from 'react-router';
import { startOfToday } from 'date-fns';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import type { PropsWithChildren } from 'react';
import { PATHS } from '@/constants';

export const TaskFormDialog: React.FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const location = useLocation();
  const fetcher = useFetcher();

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'q') {
        const target = event.target as HTMLElement;
        if (target.localName === 'textarea') return;

        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='p-0 border-0 !rounded-xl'>
        <TaskForm
          defaultFormData={{
            content: '',
            due_date: location.pathname === PATHS.TODAY ? startOfToday() : null,
            projectId: null,
          }}
          mode='create'
          onCancel={() => setOpen(false)}
          onSubmit={(formData) => {
            fetcher.submit(JSON.stringify(formData), {
              action: PATHS.APP,
              method: 'POST',
              encType: 'application/json',
            });

            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
