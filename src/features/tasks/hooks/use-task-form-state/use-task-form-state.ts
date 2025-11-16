import { useCallback, useMemo, useState } from 'react';
import type { TaskFormInput, UseTaskFormStateParams } from '../../types';

export const useTaskFormState = ({ defaultValues }: UseTaskFormStateParams = {}) => {
  const [content, setContent] = useState(defaultValues?.content || '');
  const [dueDate, setDueDate] = useState<Date | null>(defaultValues?.due_date || null);
  const [projectId, setProjectId] = useState<string | null>(defaultValues?.projectId || null);

  const formValues = useMemo<TaskFormInput>(
    () => ({
      id: defaultValues?.id,
      content,
      due_date: dueDate,
      projectId,
    }),
    [defaultValues?.id, content, dueDate, projectId]
  );
  const isValid = useMemo(() => content.trim().length > 0, [content]);

  const handleReset = useCallback(() => {
    setContent(defaultValues?.content || '');
    setDueDate(defaultValues?.due_date || null);
    setProjectId(defaultValues?.projectId || null);
  }, [defaultValues?.content, defaultValues?.due_date, defaultValues?.projectId]);
  const removeDueDate = useCallback(() => {
    setDueDate(null);
  }, []);

  return {
    formValues,
    content,
    dueDate,
    projectId,
    isValid,

    setContent,
    setDueDate,
    setProjectId,
    removeDueDate,
    handleReset,
  };
};
