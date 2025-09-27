import { SIDEBAR_LINKS } from '@/constants';
import { ITaskCounts } from '@/interfaces';
import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from 'react-router';
import { getBadgeCount } from '@/lib/utils';

interface SideNavItemProps {
  item: (typeof SIDEBAR_LINKS)[number];
  isActive: boolean;
  taskCounts: ITaskCounts;
  onItemClick: () => void;
}

export const SideNavItem = ({ item, isActive, taskCounts, onItemClick }: SideNavItemProps) => {
  const badgeCount = getBadgeCount(item.href, taskCounts);
  const showBadge = Boolean(badgeCount && badgeCount > 0);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        onClick={onItemClick}>
        <Link to={item.href}>
          <item.icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>

      {showBadge && <SidebarMenuBadge>{badgeCount}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
};
