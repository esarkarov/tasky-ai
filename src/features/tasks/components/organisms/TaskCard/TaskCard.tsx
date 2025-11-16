import { ProjectEntity } from '@/features/projects/types';
import { TaskForm } from '@/features/tasks/components/organisms/TaskForm/TaskForm';
import { TaskItem } from '@/features/tasks/components/organisms/TaskItem/TaskItem';
import { useTaskMutation } from '@/features/tasks/hooks/use-task-mutation';
import { TaskEntity } from '@/features/tasks/types';
import { useDisclosure } from '@/shared/hooks/use-disclosure/use-disclosure';
import { memo } from 'react';
import { useFetcher } from 'react-router';

interface TaskCardProps {
  id: string;
  content: string;
  completed: boolean;
  dueDate: Date | null;
  project: ProjectEntity;
}

export const TaskCard = memo(({ id, content, completed, dueDate, project }: TaskCardProps) => {
  const fetcher = useFetcher();
  const { isOpen, open: openForm, close: cancelForm } = useDisclosure();
  const { handleUpdate } = useTaskMutation({
    onSuccess: cancelForm,
  });

  const task: TaskEntity = Object.assign(
    {
      id,
      content,
      completed,
      due_date: dueDate,
      project,
    },
    fetcher.json as TaskEntity
  );

  return (
    <article
      className="task-card"
      role="listitem"
      aria-label={`Task: ${task.content}`}
      aria-checked={task.completed}>
      {!isOpen ? (
        <TaskItem
          task={task}
          project={project}
          handleEdit={openForm}
        />
      ) : (
        <TaskForm
          className="my-1"
          defaultValues={{
            ...task,
            projectId: project && project?.$id,
          }}
          mode="update"
          handleCancel={openForm}
          onSubmit={handleUpdate}
        />
      )}
    </article>
  );
});

TaskCard.displayName = 'TaskCard';
