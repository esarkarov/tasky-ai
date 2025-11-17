import { EditTaskButton } from '@/features/tasks/components/atoms/EditTaskButton/EditTaskButton';
import { useTaskMutation } from '@/features/tasks/hooks/use-task-mutation/use-task-mutation';
import { Task } from '@/features/tasks/types';
import { ConfirmationDialog } from '@/shared/components/molecules/ConfirmationDialog/ConfirmationDialog';

interface TaskActionsProps {
  task: Task;
  handleEdit: () => void;
}

export const TaskActions = ({ task, handleEdit }: TaskActionsProps) => {
  const { handleDelete } = useTaskMutation();

  return (
    <div
      className="absolute right-0 top-1.5 flex items-center gap-1 bg-background ps-1 opacity-0 shadow-[-10px_0_5px_hsl(var(--background))] group-hover/card:opacity-100 focus-within:opacity-100 max-md:opacity-100"
      role="group"
      aria-label="Task actions">
      {!task.completed && <EditTaskButton onClick={handleEdit} />}
      <ConfirmationDialog
        id={task.id}
        label={task.content}
        handleDelete={handleDelete}
        variant="icon"
        title="Delete task?"
      />
    </div>
  );
};
