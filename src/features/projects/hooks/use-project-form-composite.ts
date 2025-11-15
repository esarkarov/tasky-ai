import { useAITaskGeneration } from '@/features/ai/hooks/use-ai-task-generations';
import { useCallback, useMemo, useState } from 'react';
import type { ProjectFormInput, UseProjectFormCompositeParams } from '../types';
import { useColorPicker } from './use-color-picker';
import { useProjectFormState } from './use-project-form-state';

export const useProjectFormComposite = ({
  defaultValues,
  onSubmit,
  enableAI = false,
}: UseProjectFormCompositeParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useProjectFormState({ defaultValues });
  const colorPicker = useColorPicker({
    defaultColor: form.color,
    onColorChange: form.setColor,
  });
  const ai = useAITaskGeneration({ enabled: enableAI });

  const formValues = useMemo<ProjectFormInput>(
    () => ({
      ...form.formValues,
      ai_task_gen: ai.aiEnabled,
      task_gen_prompt: ai.aiPrompt,
    }),
    [form.formValues, ai.aiEnabled, ai.aiPrompt]
  );
  const isValid = useMemo(() => {
    return form.isValid && ai.isValid;
  }, [form.isValid, ai.isValid]);

  const handleReset = useCallback(() => {
    form.handleReset();
    colorPicker.cancelSelect();
    ai.handleReset();
    setIsSubmitting(false);
  }, [form, colorPicker, ai]);
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
      handleReset();
    } catch (error) {
      console.error('Project submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isValid, onSubmit, formValues, handleReset]);

  return {
    formValues,
    name: form.name,
    color: colorPicker.selectedColor,
    aiEnabled: ai.aiEnabled,
    aiPrompt: ai.aiPrompt,
    colorPickerOpen: colorPicker.isOpen,
    isSubmitting,
    isValid,

    setName: form.setName,
    setColor: form.setColor,
    setAiEnabled: ai.setAiEnabled,
    setAiPrompt: ai.setAiPrompt,
    setColorPickerOpen: (open: boolean) => (open ? colorPicker.openSelect() : colorPicker.cancelSelect()),
    handleColorSelect: colorPicker.handleColorSelect,
    handleSubmit,
    handleReset,
  };
};
