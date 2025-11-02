import { ProjectFormDialog } from '@/components/organisms/ProjectFormDialog';
import { SidebarGroupAction } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

export const AddProjectButton = () => {
  return (
    <Tooltip>
      <ProjectFormDialog method="POST">
        <TooltipTrigger asChild>
          <SidebarGroupAction aria-label="Add project">
            <Plus aria-hidden="true" />
          </SidebarGroupAction>
        </TooltipTrigger>
      </ProjectFormDialog>
      <TooltipContent side="right">Add project</TooltipContent>
    </Tooltip>
  );
};
