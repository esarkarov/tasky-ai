import { useToast } from '@/hooks/use-toast';
import { ITask } from '@/interfaces';
import { ToastAction } from './ui/toast';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TaskCompletionButtonProps {
  task: ITask;
  onToggleComplete: (completed: boolean) => Promise<void>;
}

export const TaskCompletionButton = ({ task, onToggleComplete }: TaskCompletionButtonProps) => {
  const { toast } = useToast();

  const handleClick = async () => {
    const newCompletedState = !task.completed;
    await onToggleComplete(newCompletedState);

    if (newCompletedState) {
      toast({
        title: '1 task completed',
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => onToggleComplete(false)}>
            Undo
          </ToastAction>
        ),
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('group/button rounded-full w-5 h-5 mt-2', task.completed && 'bg-border')}
      role="checkbox"
      aria-checked={task.completed}
      aria-label={`Mark task as ${task.completed ? 'incomplete' : 'complete'}`}
      aria-describedby="task-content"
      onClick={handleClick}>
      <Check
        strokeWidth={4}
        className={cn(
          '!w-3 !h-3 text-muted-foreground group-hover/button:opacity-100 transition-opacity',
          task.completed ? 'opacity-100' : 'opacity-0'
        )}
      />
    </Button>
  );
};
