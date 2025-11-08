import { AllProjectsButton } from '@/components/atoms/AllProjectsButton/AllProjectsButton';
import { NavList } from '@/components/atoms/List/List';
import { ProjectSidebarNavItem } from '@/components/molecules/ProjectSidebarNavItem/ProjectSidebarNavItem';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { SidebarGroupContent, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { ProjectsLoaderData } from '@/types/loaders.types';
import { useLoaderData } from 'react-router';

interface ProjectsSidebarListProps {
  handleMobileNavigation: () => void;
}

export const ProjectsSidebarList = ({ handleMobileNavigation }: ProjectsSidebarListProps) => {
  const {
    projects: { documents: projectDocs, total },
  } = useLoaderData<ProjectsLoaderData>();

  return (
    <CollapsibleContent id="projects-list">
      <SidebarGroupContent>
        <SidebarMenu>
          {projectDocs.slice(0, 9).map((project, index) => (
            <NavList
              key={project.$id}
              index={index}>
              <ProjectSidebarNavItem
                project={project}
                handleMobileNavigation={handleMobileNavigation}
              />
            </NavList>
          ))}
          {projectDocs !== null && total > 9 && (
            <SidebarMenuItem>
              <AllProjectsButton onClick={handleMobileNavigation} />
            </SidebarMenuItem>
          )}
          {!total && (
            <SidebarMenuItem>
              <p className="text-muted-foreground text-sm p-2">Click + to add some projects</p>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </CollapsibleContent>
  );
};
