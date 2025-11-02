import { ProjectBadge } from '@/components/atoms/ProjectBadge/ProjectBadge';
import { TaskDueDate } from '@/components/atoms/TaskDueDate/TaskDueDate';
import { CardFooter } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { ProjectEntity } from '@/types/projects.types';
import { TaskEntity } from '@/types/tasks.types';
import { useLocation } from 'react-router';

interface TaskMetaProps {
  project: ProjectEntity;
  task: TaskEntity;
}

export const TaskMeta = ({ task, project }: TaskMetaProps) => {
  const { pathname } = useLocation();
  const showDueDate = Boolean(task.due_date) && pathname !== ROUTES.TODAY;
  const showProject = pathname !== ROUTES.INBOX && pathname !== ROUTES.PROJECT(project?.$id);

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
