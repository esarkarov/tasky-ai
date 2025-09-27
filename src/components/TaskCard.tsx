import { TaskForm } from '@/components/TaskForm';
import { HTTP_METHODS, ROUTES } from '@/constants';
import { ITask, ITaskForm } from '@/interfaces';
import type { Models } from 'appwrite';
import { useCallback, useState } from 'react';
import { useFetcher } from 'react-router';
import { TaskDisplay } from './TaskDisplay';

interface TaskCardProps {
  id: string;
  content: string;
  completed: boolean;
  dueDate: Date;
  project: Models.Document | null;
}

export const TaskCard = ({ id, content, completed, dueDate, project }: TaskCardProps) => {
  const fetcher = useFetcher();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fetcherTask = fetcher.json as unknown as ITask;
  const task: ITask = Object.assign(
    {
      id,
      content,
      completed,
      due_date: dueDate,
      project,
    },
    fetcherTask
  );

  const handleToggleComplete = useCallback(
    async (newCompletedState: boolean) => {
      await fetcher.submit(JSON.stringify({ id: task.id, completed: newCompletedState }), {
        action: ROUTES.APP,
        method: HTTP_METHODS.PUT,
        encType: 'application/json',
      });
    },
    [fetcher, task.id]
  );

  const handleSubmitEdit = useCallback(
    (formData: ITaskForm) => {
      fetcher.submit(JSON.stringify(formData), {
        action: ROUTES.APP,
        method: HTTP_METHODS.PUT,
        encType: 'application/json',
      });
      setIsEditing(false);
    },
    [fetcher]
  );

  const handleDelete = useCallback(() => {
    fetcher.submit(JSON.stringify({ id: task.id }), {
      action: ROUTES.APP,
      method: HTTP_METHODS.DELETE,
      encType: 'application/json',
    });
  }, [fetcher, task.id]);

  return (
    <>
      {!isEditing ? (
        <TaskDisplay
          task={task}
          project={project}
          onToggleComplete={handleToggleComplete}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
        />
      ) : (
        <TaskForm
          className="my-1"
          defaultFormData={{
            ...task,
            projectId: '9249dbb79876',
          }}
          mode="edit"
          onCancel={() => setIsEditing(false)}
          onSubmit={handleSubmitEdit}
        />
      )}
    </>
  );
};
