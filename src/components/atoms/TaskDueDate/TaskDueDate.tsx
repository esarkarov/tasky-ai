import { cn } from '@/utils/ui/ui.utils';
import { formatCustomDate } from '@/utils/date/date.utils';
import { getTaskDueDateColorClass } from '@/utils/ui/ui.utils';
import { CalendarDays } from 'lucide-react';

interface TaskDueDateProps {
  completed: boolean;
  dueDate: Date | string | null;
}

export const TaskDueDate = ({ completed, dueDate }: TaskDueDateProps) => {
  if (!dueDate) return null;
  const formattedDate = formatCustomDate(dueDate);
  const dateTime = new Date(dueDate).toISOString();

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs text-muted-foreground',
        getTaskDueDateColorClass(dueDate as Date, completed)
      )}
      aria-label="Task due date">
      <CalendarDays
        size={14}
        aria-hidden="true"
      />
      <time dateTime={dateTime}>{formattedDate}</time>
    </div>
  );
};
