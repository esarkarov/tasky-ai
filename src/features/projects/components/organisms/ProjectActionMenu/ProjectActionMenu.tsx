import { ProjectFormDialog } from '@/features/projects/components/organisms/ProjectFormDialog/ProjectFormDialog';
import { useProjectOperations } from '@/features/projects/hooks/use-project-operations';
import { ProjectInput } from '@/features/projects/types';
import { ConfirmationDialog } from '@/shared/components/molecules/ConfirmationDialog/ConfirmationDialog';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu';
import { Edit } from 'lucide-react';

interface ProjectActionMenuProps extends DropdownMenuContentProps {
  defaultValues: ProjectInput;
}

export const ProjectActionMenu = ({ children, defaultValues, ...props }: ProjectActionMenuProps) => {
  const { handleDeleteProject } = useProjectOperations({
    projectData: defaultValues,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        {...props}
        aria-label={`Actions for project ${defaultValues.name}`}>
        <DropdownMenuItem asChild>
          <ProjectFormDialog
            method="PUT"
            defaultValues={defaultValues}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start px-2"
              aria-label={`Edit project ${defaultValues.name}`}>
              <Edit aria-hidden="true" /> Edit
            </Button>
          </ProjectFormDialog>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <ConfirmationDialog
            id={defaultValues.id as string}
            label={defaultValues.name}
            handleDelete={handleDeleteProject}
            variant="menu-item"
            title="Delete Project?"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
