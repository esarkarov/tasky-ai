import { ConfirmationDialog } from '@/components/molecules/ConfirmationDialog/ConfirmationDialog';
import { ProjectFormDialog } from '@/components/organisms/ProjectFormDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectOperations } from '@/hooks/use-project-operations';
import { ProjectInput } from '@/types/projects.types';
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
