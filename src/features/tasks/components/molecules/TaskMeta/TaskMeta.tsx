import { ProjectBadge } from '@/features/projects/components/atoms/ProjectBadge/ProjectBadge';
import { Project } from '@/features/projects/types';
import { TaskDueDate } from '@/features/tasks/components/atoms/TaskDueDate/TaskDueDate';
import { Task } from '@/features/tasks/types';
import { CardFooter } from '@/shared/components/ui/card';
import { ROUTES } from '@/shared/constants';
import { useLocation } from 'react-router';

interface TaskMetaProps {
  project: Project;
  task: Task;
}

export const TaskMeta = ({ task, project }: TaskMetaProps) => {
  const { pathname } = useLocation();
  const showDueDate = Boolean(task.due_date) && pathname !== ROUTES.TODAY;
  const showProject = task.project?.$id && pathname !== ROUTES.INBOX && task.project.$id !== project?.$id;

  if (!showDueDate && !showProject) return null;

  return (
    <CardFooter
      className="flex gap-4 p-0"
      role="contentinfo">
      {showDueDate && (
        <TaskDueDate
          completed={task.completed}
          dueDate={task.due_date}
        />
      )}
      {showProject && <ProjectBadge project={task?.project} />}
    </CardFooter>
  );
};
