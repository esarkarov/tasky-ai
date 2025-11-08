import { ProjectSidebarNavLink } from '@/components/molecules/ProjectSidebarNavLink/ProjectSidebarNavLink';
import { ProjectActionMenu } from '@/components/organisms/ProjectActionMenu';
import { SidebarMenuAction, SidebarMenuItem } from '@/components/ui/sidebar';
import { ProjectListItem } from '@/types/projects.types';
import { MoreHorizontal } from 'lucide-react';

interface ProjectSidebarNavItemProps {
  project: ProjectListItem;
  handleMobileNavigation: () => void;
}

export const ProjectSidebarNavItem = ({ project, handleMobileNavigation }: ProjectSidebarNavItemProps) => {
  return (
    <SidebarMenuItem>
      <ProjectSidebarNavLink
        id={project.$id}
        colorHex={project.color_hex}
        name={project.name}
        onClick={handleMobileNavigation}
      />

      <ProjectActionMenu
        defaultValues={{
          id: project.$id,
          name: project.name,
          color_name: project.color_name,
          color_hex: project.color_hex,
        }}
        side="right"
        align="start">
        <SidebarMenuAction
          aria-label={`More actions for project ${project.name}`}
          showOnHover
          className="bg-sidebar-accent">
          <MoreHorizontal aria-hidden="true" />
        </SidebarMenuAction>
      </ProjectActionMenu>
    </SidebarMenuItem>
  );
};
