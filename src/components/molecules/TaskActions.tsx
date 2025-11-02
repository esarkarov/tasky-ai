import { EditTaskButton } from '@/components/atoms/EditTaskButton/EditTaskButton';
import { ConfirmationDialog } from '@/components/molecules/ConfirmationDialog';
import { useTaskOperations } from '@/hooks/use-task-operations';
import { TaskEntity } from '@/types/tasks.types';

interface TaskActionsProps {
  task: TaskEntity;
  handleEdit: () => void;
}

export const TaskActions = ({ task, handleEdit }: TaskActionsProps) => {
  const { handleDeleteTask } = useTaskOperations();

  return (
    <div
      className="absolute right-0 top-1.5 flex items-center gap-1 bg-background ps-1 opacity-0 shadow-[-10px_0_5px_hsl(var(--background))] group-hover/card:opacity-100 focus-within:opacity-100 max-md:opacity-100"
      role="group"
      aria-label="Task actions">
      {!task.completed && <EditTaskButton onClick={handleEdit} />}
      <ConfirmationDialog
        id={task.id}
        label={task.content}
        handleDelete={handleDeleteTask}
        variant="icon"
        title="Delete task?"
      />
    </div>
  );
};
