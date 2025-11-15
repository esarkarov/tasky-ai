import { ProjectPicker } from '@/features/projects/components/molecules/ProjectPicker/ProjectPicker';
import { TaskContentInput } from '@/features/tasks/components/molecules/TaskContentInput/TaskContentInput';
import { TaskDueDatePicker } from '@/features/tasks/components/molecules/TaskDueDatePicker/TaskDueDatePicker';
import { TaskFormActions } from '@/features/tasks/components/molecules/TaskFormActions/TaskFormActions';
import { useTaskFormComposite } from '@/features/tasks/hooks/use-task-form-composite';
import { useTaskMutation } from '@/features/tasks/hooks/use-task-mutation';
import { TaskFormInput } from '@/features/tasks/types';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { DEFAULT_TASK_FORM_DATA } from '@/shared/constants/defaults';
import { CrudMode, ProjectsLoaderData } from '@/shared/types';
import { cn } from '@/shared/utils/ui/ui.utils';
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
  const { isLoading } = useTaskMutation({
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
  } = useTaskFormComposite({
    projects: projectDocs,
    defaultValues,
    onSubmit,
    onCancel: handleCancel,
  });
  const isPending = isSubmitting || isLoading;

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
