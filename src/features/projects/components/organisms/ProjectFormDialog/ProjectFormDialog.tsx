import { ProjectForm } from '@/features/projects/components/organisms/ProjectForm/ProjectForm';
import { useProjectOperations } from '@/features/projects/hooks/use-project-operations';
import { ProjectInput } from '@/features/projects/types';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import { HttpMethod } from '@/shared/types';
import { ReactNode, useState } from 'react';

interface ProjectFormDialogProps {
  defaultValues?: ProjectInput;
  children: ReactNode;
  method: HttpMethod;
}

export const ProjectFormDialog = ({ defaultValues, children, method }: ProjectFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const { handleSaveProject, formState } = useProjectOperations({
    onSuccess: () => setOpen(false),
    method,
  });
  const isPostMethod = method === 'POST';

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="p-0 border-0 !rounded-xl"
        aria-label={isPostMethod ? 'Create project form' : 'Edit project form'}>
        <ProjectForm
          mode={isPostMethod ? 'create' : 'update'}
          defaultValues={defaultValues}
          handleCancel={() => setOpen(false)}
          onSubmit={handleSaveProject}
          isSubmitting={formState}
        />
      </DialogContent>
    </Dialog>
  );
};
