import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { TASK_SIDEBAR_LINKS } from '@/constants/app-links';
import { TaskCounts } from '@/types/tasks.types';
import { getBadgeCount } from '@/utils/ui/ui.utils';
import { memo } from 'react';
import { Link } from 'react-router';

interface TaskSidebarNavLinkProps {
  link: (typeof TASK_SIDEBAR_LINKS)[number];
  isActive: boolean;
  taskCounts: TaskCounts;
  onClick: () => void;
}

export const TaskSidebarNavLink = memo(({ link, isActive, taskCounts, onClick }: TaskSidebarNavLinkProps) => {
  const badgeCount = getBadgeCount(link.href, taskCounts);
  const showBadge = Boolean(badgeCount && badgeCount > 0);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        onClick={onClick}>
        <Link
          to={link.href}
          aria-current={isActive ? 'page' : undefined}
          aria-label={link.label}>
          <link.icon aria-hidden="true" />
          <span>{link.label}</span>
        </Link>
      </SidebarMenuButton>

      {showBadge && <SidebarMenuBadge aria-label={`${badgeCount} tasks`}>{badgeCount}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
});

TaskSidebarNavLink.displayName = 'SideNavItem';
