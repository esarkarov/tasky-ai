import { CancelProjectButton } from '@/components/atoms/CancelProjectButton/CancelProjectButton';
import { SubmitProjectButton } from '@/components/atoms/SubmitProjectButton/SubmitProjectButton';
import { AITaskGenerator } from '@/components/molecules/AITaskGenerator';
import { ColorPicker } from '@/components/molecules/ColorPicker';
import { ProjectNameInput } from '@/components/molecules/ProjectNameInput';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PROJECT_FORM_DATA } from '@/constants/defaults';
import { useProjectForm } from '@/hooks/use-project-form';
import { ProjectFormInput, ProjectInput } from '@/types/projects.types';
import { CrudMode } from '@/types/shared.types';
import { cn } from '@/utils/ui/ui.utils';

interface ProjectFormProps {
  mode: CrudMode;
  defaultValues?: ProjectInput;
  isSubmitting?: boolean;
  handleCancel: () => void;
  onSubmit: (formData: ProjectFormInput) => Promise<void>;
}

export const ProjectForm = ({
  defaultValues = DEFAULT_PROJECT_FORM_DATA,
  mode,
  handleCancel,
  onSubmit,
  isSubmitting: externalSubmitting = false,
}: ProjectFormProps) => {
  const {
    name,
    color,
    aiEnabled,
    aiPrompt,
    colorPickerOpen,
    isSubmitting: internalSubmitting,
    isValid,
    setName,
    setAiEnabled,
    setAiPrompt,
    setColorPickerOpen,
    handleColorSelect,
    handleSubmit,
  } = useProjectForm({
    defaultValues,
    onSubmit,
  });

  const isPending = internalSubmitting || externalSubmitting;
  const isCreateMode = mode === 'create';

  return (
    <Card
      role="form"
      aria-labelledby="project-form-title"
      className={cn(
        'focus-within:border-foreground/30 transition-opacity',
        isPending && 'animate-pulse pointer-events-none'
      )}>
      <CardHeader className="p-4">
        <CardTitle id="project-form-title">{isCreateMode ? 'Add project' : 'Edit project'}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 grid grid-cols-1 gap-3">
        <ProjectNameInput
          value={name}
          onChange={setName}
          disabled={isPending}
        />
        <ColorPicker
          open={colorPickerOpen}
          value={color}
          disabled={isPending}
          onOpenChange={setColorPickerOpen}
          handleColorSelect={handleColorSelect}
        />
        {isCreateMode && (
          <AITaskGenerator
            checked={aiEnabled}
            value={aiPrompt}
            disabled={isPending}
            onCheckedChange={setAiEnabled}
            onValueChange={setAiPrompt}
          />
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-end gap-3 p-4">
        <CancelProjectButton onClick={handleCancel} />
        <SubmitProjectButton
          mode={mode}
          onClick={handleSubmit}
          disabled={isValid || isPending}
        />
      </CardFooter>
    </Card>
  );
};
