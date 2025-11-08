import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroupLabel } from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';

export const ProjectsSidebarLabel = () => {
  return (
    <SidebarGroupLabel
      asChild
      className="text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
      <CollapsibleTrigger
        aria-expanded
        aria-controls="projects-list">
        <ChevronRight className="me-2 transition-transform group-data-[state=open]/collapsible:rotate-90" />
        Projects
      </CollapsibleTrigger>
    </SidebarGroupLabel>
  );
};
