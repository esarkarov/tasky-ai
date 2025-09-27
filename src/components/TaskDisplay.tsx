import { ITask } from '@/interfaces';
import { Card, CardContent } from './ui/card';
import { TaskMetadata } from './TaskMetaData';
import { TaskActions } from './TaskActions';
import { cn } from '@/lib/utils';
import { TaskCompletionButton } from './TaskCompletionButton';
import { Models } from 'appwrite';

interface TaskDisplayProps {
  project: Models.Document | null;
  task: ITask;
  onToggleComplete: (completed: boolean) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskDisplay = ({
  project,
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskDisplayProps) => (
  <div className="group/card relative grid grid-cols-[max-content,minmax(0,1fr)] gap-3 border-b">
    <TaskCompletionButton
      task={task}
      onToggleComplete={onToggleComplete}
    />

    <Card className="rounded-none py-2 space-y-1.5 border-none">
      <CardContent className="p-0">
        <p
          id="task-content"
          className={cn(
            'text-sm max-md:me-16',
            task.completed && 'text-muted-foreground line-through'
          )}>
          {task.content}
        </p>
      </CardContent>

      <TaskMetadata
        task={task}
        project={project}
      />
    </Card>

    <TaskActions
      task={task}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  </div>
);
