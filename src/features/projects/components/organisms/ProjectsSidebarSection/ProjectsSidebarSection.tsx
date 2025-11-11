import { AddProjectButton } from '@/features/projects/components/atoms/AddProjectButton/AddProjectButton';
import { ProjectsSidebarLabel } from '@/features/projects/components/molecules/ProjectsSidebarLabel/ProjectsSidebarLabel';
import { ProjectsSidebarList } from '@/features/projects/components/organisms/ProjectsSidebarList/ProjectsSidebarList';
import { Collapsible } from '@/shared/components/ui/collapsible';
import { SidebarGroup } from '@/shared/components/ui/sidebar';

interface ProjectsSidebarSectionProps {
  handleMobileNavigation: () => void;
}

export const ProjectsSidebarSection = ({ handleMobileNavigation }: ProjectsSidebarSectionProps) => {
  return (
    <Collapsible
      defaultOpen
      className="group/collapsible">
      <SidebarGroup>
        <ProjectsSidebarLabel />
        <AddProjectButton />
        <ProjectsSidebarList handleMobileNavigation={handleMobileNavigation} />
      </SidebarGroup>
    </Collapsible>
  );
};
