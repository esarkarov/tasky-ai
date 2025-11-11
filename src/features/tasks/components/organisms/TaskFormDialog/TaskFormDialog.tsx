import { TaskForm } from '@/features/tasks/components/organisms/TaskForm/TaskForm';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import { ROUTES } from '@/shared/constants/routes';
import { useTaskOperations } from '@/features/tasks/hooks/use-task-operations';
import { startOfToday } from 'date-fns';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router';

export const TaskFormDialog: React.FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const { handleCreateTask } = useTaskOperations({
    onSuccess: () => setIsOpen(false),
  });
  const isToday = pathname === ROUTES.TODAY;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
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
          handleCancel={() => setIsOpen(false)}
          onSubmit={handleCreateTask}
        />
      </DialogContent>
    </Dialog>
  );
};
