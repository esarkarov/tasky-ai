import { TaskForm } from '@/features/tasks/components/organisms/TaskForm/TaskForm';
import { useTaskMutation } from '@/features/tasks/hooks/use-task-mutation';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import { ROUTES } from '@/shared/constants/routes';
import { useDisclosure } from '@/shared/hooks/use-disclosure';
import { startOfToday } from 'date-fns';
import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router';

export const TaskFormDialog: React.FC<PropsWithChildren> = ({ children }) => {
  const { isOpen: open, setIsOpen: onOpenChange, close: cancelForm } = useDisclosure();
  const { handleCreate } = useTaskMutation({
    onSuccess: cancelForm,
  });
  const { pathname } = useLocation();
  const isToday = pathname === ROUTES.TODAY;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="p-0 border-0 !rounded-xl"
        aria-label="Create new task form">
        <TaskForm
          defaultValues={{
            content: '',
            due_date: isToday ? startOfToday() : null,
            projectId: null,
          }}
          mode="create"
          handleCancel={cancelForm}
          onSubmit={handleCreate}
        />
      </DialogContent>
    </Dialog>
  );
};
