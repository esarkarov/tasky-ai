import { ProjectForm } from '@/features/projects/components/organisms/ProjectForm/ProjectForm';
import { useProjectModal } from '@/features/projects/hooks/use-project-modal/use-project-modal';
import { ProjectInput } from '@/features/projects/types';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import { useDisclosure } from '@/shared/hooks/use-disclosure/use-disclosure';
import { HttpMethod } from '@/shared/types';
import { ReactNode } from 'react';

interface ProjectFormDialogProps {
  defaultValues?: ProjectInput;
  children: ReactNode;
  method: HttpMethod;
}

export const ProjectFormDialog = ({ defaultValues, children, method }: ProjectFormDialogProps) => {
  const { isLoading, handleSave } = useProjectModal();
  const { isOpen: open, setIsOpen: onOpenChange, close: cancelForm } = useDisclosure();
  const isPostMethod = method === 'POST';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="p-0 border-0 !rounded-xl"
        aria-label={isPostMethod ? 'Create project form' : 'Edit project form'}>
        <ProjectForm
          mode={isPostMethod ? 'create' : 'update'}
          defaultValues={defaultValues}
          handleCancel={cancelForm}
          onSubmit={handleSave}
          isSubmitting={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
