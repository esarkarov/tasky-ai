import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { IProjectInfo, ITaskForm } from '@/interfaces';
import { DEFAULT_FORM_DATA } from '@/constants';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { TTaskMode } from '@/types';
import { DueDateSelector } from './DueDateSelector';
import { ProjectSelector } from './ProjectSelector';
import { TaskContentInput } from './TaskContentInput';
import { TaskFormActions } from './TaskFormActions';
import type { ClassValue } from 'clsx';
import * as chrono from 'chrono-node';

interface TaskFormProps {
  defaultFormData?: ITaskForm;
  className?: ClassValue;
  mode: TTaskMode;
  onCancel?: () => void;
  onSubmit?: (formData: ITaskForm) => void;
}

export const TaskForm = ({
  defaultFormData = DEFAULT_FORM_DATA,
  className,
  mode,
  onCancel,
  onSubmit,
}: TaskFormProps) => {
  const [taskContent, setTaskContent] = useState(defaultFormData.content);
  const [dueDate, setDueDate] = useState(defaultFormData.due_date);
  const [projectId] = useState(defaultFormData.projectId);
  const [projectInfo, setProjectInfo] = useState<IProjectInfo>({
    name: '',
    colorHex: '',
  });
  const [formData, setFormData] = useState<ITaskForm>({
    content: '',
    due_date: null,
    projectId: '9249dbb79876',
  });

  useEffect(() => {
    if (projectId) {
      setProjectInfo({
        name: 'Project Name',
        colorHex: '#000000',
      });
    }
  }, [projectId]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      content: taskContent,
      due_date: dueDate,
      projectId: projectId,
    }));
  }, [taskContent, dueDate, projectId]);

  useEffect(() => {
    const chronoParsed = chrono.parse(taskContent);

    if (chronoParsed.length) {
      const lastDate = chronoParsed[chronoParsed.length - 1];

      setDueDate(lastDate.date());
    }
  }, [taskContent]);

  const handleSubmit = useCallback(() => {
    if (!taskContent) return;

    if (onSubmit) onSubmit(formData);

    setTaskContent('');
  }, [taskContent, onSubmit, formData]);

  const isValid = taskContent.trim().length > 0;

  return (
    <Card className={cn('focus-within:border-foreground/30', className)}>
      <CardContent className='p-2'>
        <TaskContentInput
          value={taskContent}
          onChange={setTaskContent}
          onSubmit={handleSubmit}
        />

        <DueDateSelector
          dueDate={dueDate}
          onDateChange={setDueDate}
          onDateRemove={() => setDueDate(null)}
        />
      </CardContent>

      <Separator />

      <CardFooter className='grid grid-cols-[minmax(0,1fr),max-content] gap-2 p-2'>
        <ProjectSelector projectInfo={projectInfo} />

        <TaskFormActions
          isValid={isValid}
          mode={mode}
          onCancel={onCancel}
          onSubmit={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
};
