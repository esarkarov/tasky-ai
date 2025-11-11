import { ProjectEntity } from '@/features/projects/types';
import { CompleteTaskButton } from '@/features/tasks/components/atoms/CompleteTaskButton/CompleteTaskButton';
import { TaskActions } from '@/features/tasks/components/molecules/TaskActions/TaskActions';
import { TaskMeta } from '@/features/tasks/components/molecules/TaskMeta/TaskMeta';
import { TaskEntity } from '@/features/tasks/types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/ui/ui.utils';

interface TaskItemProps {
  project: ProjectEntity;
  task: TaskEntity;
  handleEdit: () => void;
}

export const TaskItem = ({ project, task, handleEdit }: TaskItemProps) => (
  <div
    className="group/card relative grid grid-cols-[max-content,minmax(0,1fr)] gap-3 border-b"
    role="group"
    aria-labelledby={`task-${task.id}-content`}
    aria-describedby={`task-${task.id}-metadata`}>
    <CompleteTaskButton
      taskId={task.id}
      completed={task.completed}
    />
    <Card className="rounded-none py-2 space-y-1.5 border-none">
      <CardContent className="p-0">
        <p
          id={`task-${task.id}-content`}
          className={cn('text-sm max-md:me-16', task.completed && 'text-muted-foreground line-through')}>
          {task.content}
        </p>
      </CardContent>
      <TaskMeta
        task={task}
        project={project}
      />
    </Card>
    <TaskActions
      task={task}
      handleEdit={handleEdit}
    />
  </div>
);
