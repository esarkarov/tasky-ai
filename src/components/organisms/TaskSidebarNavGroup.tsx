import { NavList } from '@/components/atoms/List/List';
import { TaskSidebarNavLink } from '@/components/molecules/TaskSidebarNavLink';
import { TaskFormDialog } from '@/components/organisms/TaskFormDialog';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { TASK_SIDEBAR_LINKS } from '@/constants/app-links';
import { TaskCounts } from '@/types/tasks.types';
import { CirclePlus } from 'lucide-react';

interface TaskSidebarNavGroupProps {
  currentPath: string;
  taskCounts: TaskCounts;
  handleMobileNavigation: () => void;
}

export const TaskSidebarNavGroup = ({ currentPath, taskCounts, handleMobileNavigation }: TaskSidebarNavGroupProps) => (
  <SidebarGroup
    role="navigation"
    aria-label="Primary navigation">
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <TaskFormDialog>
            <SidebarMenuButton
              className="!text-primary"
              aria-label="Add new task">
              <CirclePlus aria-hidden="true" />
              <span>Add task</span>
            </SidebarMenuButton>
          </TaskFormDialog>
        </SidebarMenuItem>
        {TASK_SIDEBAR_LINKS.map((link, index) => (
          <NavList
            key={link.label}
            index={index}>
            <TaskSidebarNavLink
              key={index}
              link={link}
              isActive={currentPath === link.href}
              taskCounts={taskCounts}
              onClick={handleMobileNavigation}
            />
          </NavList>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);
