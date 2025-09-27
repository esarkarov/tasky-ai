import { ITaskCounts } from '@/interfaces';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SIDEBAR_LINKS } from '@/constants';
import { TaskFormDialog } from './TaskFormDialog';
import { CirclePlus } from 'lucide-react';
import { SideNavItem } from './SideNavItem';

interface SideNavMenuProps {
  currentPath: string;
  taskCounts: ITaskCounts;
  onItemClick: () => void;
}

export const SideNavMenu = ({ currentPath, taskCounts, onItemClick }: SideNavMenuProps) => (
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <TaskFormDialog>
            <SidebarMenuButton className="!text-primary">
              <CirclePlus />
              Add task
            </SidebarMenuButton>
          </TaskFormDialog>
        </SidebarMenuItem>

        {SIDEBAR_LINKS.map((item, index) => (
          <SideNavItem
            key={index}
            item={item}
            isActive={currentPath === item.href}
            taskCounts={taskCounts}
            onItemClick={onItemClick}
          />
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);
