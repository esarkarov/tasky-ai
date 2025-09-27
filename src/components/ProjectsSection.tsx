import { ChevronRight, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const ProjectsSection = () => (
  <Collapsible
    defaultOpen
    className="group/collapsible">
    <SidebarGroup>
      <SidebarGroupLabel
        asChild
        className="text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <CollapsibleTrigger>
          <ChevronRight className="me-2 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          Projects
        </CollapsibleTrigger>
      </SidebarGroupLabel>

      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarGroupAction aria-label="Add project">
            <Plus />
          </SidebarGroupAction>
        </TooltipTrigger>
        <TooltipContent side="right">Add project</TooltipContent>
      </Tooltip>

      <CollapsibleContent>
        <SidebarGroupContent>
          <SidebarMenu />
        </SidebarGroupContent>
      </CollapsibleContent>
    </SidebarGroup>
  </Collapsible>
);
