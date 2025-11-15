import { AITaskGenerator } from '@/features/ai/components/molecules/AITaskGenerator/AITaskGenerator';
import { CancelProjectButton } from '@/features/projects/components/atoms/CancelProjectButton/CancelProjectButton';
import { SubmitProjectButton } from '@/features/projects/components/atoms/SubmitProjectButton/SubmitProjectButton';
import { ProjectNameInput } from '@/features/projects/components/molecules/ProjectNameInput/ProjectNameInput';
import { useProjectFormComposite } from '@/features/projects/hooks/use-project-form-composite';
import { ProjectFormInput, ProjectInput } from '@/features/projects/types';
import { ColorPicker } from '@/shared/components/molecules/ColorPicker/ColorPicker';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { DEFAULT_PROJECT_FORM_DATA } from '@/shared/constants/defaults';
import { CrudMode } from '@/shared/types';
import { cn } from '@/shared/utils/ui/ui.utils';

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
  } = useProjectFormComposite({
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
