import { ProjectPicker } from '@/components/molecules/ProjectPicker/ProjectPicker';
import { TaskContentInput } from '@/components/molecules/TaskContentInput/TaskContentInput';
import { TaskDueDatePicker } from '@/components/molecules/TaskDueDatePicker/TaskDueDatePicker';
import { TaskFormActions } from '@/components/molecules/TaskFormActions/TaskFormActions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_TASK_FORM_DATA } from '@/constants/defaults';
import { useTaskForm } from '@/hooks/use-task-form';
import { useTaskOperations } from '@/hooks/use-task-operations';
import { ProjectsLoaderData } from '@/types/loaders.types';
import { CrudMode } from '@/types/shared.types';
import { TaskFormInput } from '@/types/tasks.types';
import { cn } from '@/utils/ui/ui.utils';
import type { ClassValue } from 'clsx';
import { useLoaderData } from 'react-router';

interface TaskFormProps {
  mode: CrudMode;
  className?: ClassValue;
  defaultValues?: TaskFormInput;
  onSubmit?: (formData: TaskFormInput, taskId?: string) => Promise<void>;
  handleCancel: () => void;
}

export const TaskForm = ({
  defaultValues = DEFAULT_TASK_FORM_DATA,
  className,
  mode,
  handleCancel,
  onSubmit,
}: TaskFormProps) => {
  const { formState } = useTaskOperations({
    onSuccess: handleCancel,
  });
  const {
    projects: { documents: projectDocs },
  } = useLoaderData<ProjectsLoaderData>();

  const {
    content,
    dueDate,
    selectedProject,
    isSubmitting,
    isValid,
    setContent,
    setDueDate,
    handleProjectChange,
    removeDueDate,
    handleSubmit,
  } = useTaskForm({
    projects: projectDocs,
    defaultValues,
    onSubmit,
    handleCancel,
  });
  const isPending = isSubmitting || formState;

  return (
    <Card
      role="form"
      aria-labelledby="task-form-title"
      aria-busy={isPending}
      className={cn(
        'focus-within:border-foreground/30 transition-opacity',
        isPending && 'animate-pulse pointer-events-none',
        className
      )}>
      <CardContent className="p-2">
        <h2
          id="task-form-title"
          className="sr-only">
          {mode === 'create' ? 'Create task' : 'Edit task'}
        </h2>
        <TaskContentInput
          value={content}
          onChange={setContent}
          disabled={isPending}
        />
        <TaskDueDatePicker
          dueDate={dueDate as Date}
          handleDateSelect={setDueDate}
          handleDateRemove={removeDueDate}
          disabled={isPending}
        />
      </CardContent>
      <Separator />
      <CardFooter className="grid grid-cols-[minmax(0,1fr),max-content] gap-2 p-2">
        <ProjectPicker
          value={selectedProject}
          onValueChange={handleProjectChange}
          projects={projectDocs}
          disabled={isPending}
        />
        <TaskFormActions
          disabled={isValid || isPending}
          mode={mode}
          handleCancel={handleCancel}
          handleSubmit={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
};
