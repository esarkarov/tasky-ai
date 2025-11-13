import { ColorValue, ProjectFormInput, UseProjectFormParams, UseProjectFormResult } from '@/features/projects/types';
import { useCallback, useMemo, useState } from 'react';

export const useProjectForm = ({ defaultValues, onSubmit }: UseProjectFormParams): UseProjectFormResult => {
  const [name, setName] = useState(defaultValues.name);
  const [color, setColor] = useState<ColorValue>({
    name: defaultValues.color_name,
    hex: defaultValues.color_hex,
  });
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = useMemo<ProjectFormInput>(
    () => ({
      ...defaultValues,
      name,
      color_name: color.name,
      color_hex: color.hex,
      ai_task_gen: aiEnabled,
      task_gen_prompt: aiPrompt,
    }),
    [defaultValues, name, color.name, color.hex, aiEnabled, aiPrompt]
  );

  const isValid = useMemo(() => {
    const hasName = name.trim().length > 0;
    const aiRequirementMet = !aiEnabled || aiPrompt.trim().length > 0;
    return hasName && aiRequirementMet;
  }, [name, aiEnabled, aiPrompt]);

  const handleReset = useCallback(() => {
    setName(defaultValues.name);
    setColor({
      name: defaultValues.color_name,
      hex: defaultValues.color_hex,
    });
    setAiEnabled(false);
    setAiPrompt('');
    setColorPickerOpen(false);
    setIsSubmitting(false);
  }, [defaultValues.name, defaultValues.color_name, defaultValues.color_hex]);
  const handleColorSelect = useCallback((value: string) => {
    const [colorName, colorHex] = value.split('=');
    setColor({ name: colorName, hex: colorHex });
    setColorPickerOpen(false);
  }, []);
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
    name,
    color,
    aiEnabled,
    aiPrompt,
    colorPickerOpen,
    isSubmitting,
    isValid,
    setName,
    setColor,
    setAiEnabled,
    setAiPrompt,
    setColorPickerOpen,
    handleColorSelect,
    handleSubmit,
  };
};
