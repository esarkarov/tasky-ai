import { CardFooter } from '@/components/ui/card';
import { ROUTES } from '@/constants';
import { ITask } from '@/interfaces';
import { cn, formatCustomDate, getTaskDueDateColorClass } from '@/lib/utils';
import { Models } from 'appwrite';
import { CalendarDays, Hash, Inbox } from 'lucide-react';
import { useLocation } from 'react-router';

interface TaskMetadataProps {
  project: Models.Document | null;
  task: ITask;
}

export const TaskMetadata = ({ task, project }: TaskMetadataProps) => {
  const location = useLocation();

  const showDueDate = task.due_date && location.pathname !== ROUTES.TODAY;
  const showProject =
    location.pathname !== ROUTES.INBOX && location.pathname !== ROUTES.PROJECT(project?.$id);

  if (!showDueDate && !showProject) return null;

  return (
    <CardFooter className="p-0 flex gap-4">
      {showDueDate && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs text-muted-foreground',
            getTaskDueDateColorClass(task.due_date, task.completed)
          )}>
          <CalendarDays size={14} />
          {formatCustomDate(task.due_date as Date)}
        </div>
      )}

      {showProject && (
        <div className="grid grid-cols-[minmax(0,180px),max-content] items-center gap-1 text-xs text-muted-foreground ms-auto">
          <div className="truncate text-right">{task.project?.name || 'Inbox'}</div>
          {task.project ? (
            <Hash
              size={14}
              color={task.project.color_hex}
            />
          ) : (
            <Inbox
              size={14}
              className="text-muted-foreground"
            />
          )}
        </div>
      )}
    </CardFooter>
  );
};
