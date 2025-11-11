import { SelectedProject } from '@/features/projects/types';
import { TaskFormInput, UseTaskFormParams, UseTaskFormResult } from '@/features/tasks/types';
import * as chrono from 'chrono-node';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useTaskForm = ({
  defaultValues,
  projects,
  onSubmit,
  handleCancel,
}: UseTaskFormParams): UseTaskFormResult => {
  const [content, setContent] = useState(defaultValues.content);
  const [dueDate, setDueDate] = useState<Date | null>(defaultValues.due_date);
  const [selectedProject, setSelectedProject] = useState<SelectedProject>({
    id: defaultValues.projectId,
    name: '',
    colorHex: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = useMemo<TaskFormInput>(
    () => ({
      content,
      due_date: dueDate,
      projectId: selectedProject.id,
    }),
    [content, dueDate, selectedProject.id]
  );

  const isValid = useMemo(() => content.trim().length > 0, [content]);

  useEffect(() => {
    if (selectedProject.id && projects) {
      const project = projects.find(({ $id }) => selectedProject.id === $id);
      if (project) {
        setSelectedProject({
          id: project.$id,
          name: project.name,
          colorHex: project.color_hex,
        });
      }
    }
  }, [selectedProject.id, projects]);

  useEffect(() => {
    if (content) {
      const chronoParsed = chrono.parse(content);
      if (chronoParsed.length > 0) {
        const lastDate = chronoParsed[chronoParsed.length - 1];
        setDueDate(lastDate.date());
      }
    }
  }, [content]);

  const handleReset = useCallback(() => {
    setContent('');
    setDueDate(null);
    setSelectedProject({ id: null, name: '', colorHex: '' });
    setIsSubmitting(false);
  }, []);

  const handleProjectChange = useCallback((project: SelectedProject) => {
    setSelectedProject(project);
  }, []);

  const removeDueDate = useCallback(() => {
    setDueDate(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!onSubmit || isSubmitting || !isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formValues, defaultValues.id);
      handleReset();
      handleCancel();
    } catch (error) {
      console.error('Task submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, isSubmitting, isValid, formValues, defaultValues.id, handleReset, handleCancel]);

  return {
    formValues,
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
    handleReset,
  };
};
