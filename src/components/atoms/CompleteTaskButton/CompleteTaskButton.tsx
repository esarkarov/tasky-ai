import { Button } from '@/components/ui/button';
import { useTaskOperations } from '@/hooks/use-task-operations';
import { cn } from '@/utils/ui/ui.utils';
import { Check } from 'lucide-react';

interface CompleteTaskButtonProps {
  taskId: string;
  completed: boolean;
}

export const CompleteTaskButton = ({ taskId, completed }: CompleteTaskButtonProps) => {
  const { toggleTaskComplete } = useTaskOperations();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('group/button mt-2 h-5 w-5 rounded-full', completed && 'bg-border')}
      role="checkbox"
      aria-checked={completed}
      aria-label={`Mark task as ${completed ? 'incomplete' : 'complete'}`}
      onClick={async () => {
        await toggleTaskComplete(taskId, !completed);
      }}>
      <Check
        strokeWidth={4}
        className={cn(
          '!h-3 !w-3 text-muted-foreground transition-opacity group-hover/button:opacity-100',
          completed ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />
    </Button>
  );
};
