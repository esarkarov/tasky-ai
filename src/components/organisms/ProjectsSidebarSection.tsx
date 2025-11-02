import { AddProjectButton } from '@/components/atoms/AddProjectButton/AddProjectButton';
import { ProjectsSidebarLabel } from '@/components/molecules/ProjectsSidebarLabel';
import { ProjectsSidebarList } from '@/components/organisms/ProjectsSidebarList';
import { Collapsible } from '@/components/ui/collapsible';
import { SidebarGroup } from '@/components/ui/sidebar';

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
