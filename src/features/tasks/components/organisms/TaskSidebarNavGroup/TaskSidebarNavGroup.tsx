import { TaskSidebarNavLink } from '@/features/tasks/components/molecules/TaskSidebarNavLink/TaskSidebarNavLink';
import { TaskFormDialog } from '@/features/tasks/components/organisms/TaskFormDialog/TaskFormDialog';
import { TaskCounts } from '@/features/tasks/types';
import { NavList } from '@/shared/components/atoms/List/List';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';
import { Calendar1, CalendarDays, CircleCheck, CirclePlus, Inbox, LayoutDashboard } from 'lucide-react';

const TASK_SIDEBAR_LINKS = [
  {
    href: '/app/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/app/inbox',
    label: 'Inbox',
    icon: Inbox,
  },
  {
    href: '/app/today',
    label: 'Today',
    icon: Calendar1,
  },
  {
    href: '/app/upcoming',
    label: 'Upcoming',
    icon: CalendarDays,
  },
  {
    href: '/app/completed',
    label: 'Completed',
    icon: CircleCheck,
  },
];

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
