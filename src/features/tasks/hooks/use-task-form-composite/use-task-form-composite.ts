import { useCallback, useMemo, useState } from 'react';
import type { TaskFormInput, UseTaskFormCompositeParams } from '../../types';
import { useTaskFormState } from '../use-task-form-state/use-task-form-state';
import { useProjectSelection } from '@/features/projects/hooks/use-project-selection';
import { useChronoDateParser } from '../use-chrone-date-parser/use-chrone-date-parser';

export const useTaskFormComposite = ({
  defaultValues,
  projects,
  onSubmit,
  onCancel,
  enableChronoParsing = true,
}: UseTaskFormCompositeParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useTaskFormState({ defaultValues });
  const project = useProjectSelection({
    defaultProjectId: defaultValues?.projectId,
    projects,
  });

  useChronoDateParser({
    content: form.content,
    onDateParsed: form.setDueDate,
    enabled: enableChronoParsing,
  });

  const formValues = useMemo<TaskFormInput>(() => {
    return {
      ...form.formValues,
      projectId: project.selectedProject.id,
    };
  }, [form.formValues, project.selectedProject.id]);

  const handleReset = useCallback(() => {
    form.handleReset();
    project.clearProject();
    setIsSubmitting(false);
  }, [form, project]);
  const handleSubmit = useCallback(async () => {
    if (!onSubmit || isSubmitting || !form.isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formValues, defaultValues?.id);
      handleReset();
      onCancel?.();
    } catch (error) {
      console.error('Task submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, form.isValid, onSubmit, formValues, defaultValues?.id, handleReset, onCancel]);

  return {
    formValues,
    content: form.content,
    dueDate: form.dueDate,
    selectedProject: project.selectedProject,
    isSubmitting,
    isValid: form.isValid,

    setContent: form.setContent,
    setDueDate: form.setDueDate,
    handleProjectChange: project.handleProjectChange,
    removeDueDate: form.removeDueDate,
    handleSubmit,
    handleReset,
  };
};
