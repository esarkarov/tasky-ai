import { ProjectsSidebarSection } from '@/features/projects/components/organisms/ProjectsSidebarSection/ProjectsSidebarSection';
import { TaskSidebarNavGroup } from '@/features/tasks/components/organisms/TaskSidebarNavGroup/TaskSidebarNavGroup';
import { Logo } from '@/shared/components/atoms/Logo/Logo';
import { UserChip } from '@/shared/components/atoms/UserChip/UserChip';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/shared/components/ui/sidebar';
import { ROUTES } from '@/shared/constants';
import { SidebarLoaderData } from '@/shared/types';
import { Link, useLoaderData, useLocation } from 'react-router';

export const AppSidebar = () => {
  const { pathname } = useLocation();
  const { taskCounts } = useLoaderData<SidebarLoaderData>();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleMobileNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      role="navigation"
      aria-label="Main sidebar">
      <SidebarHeader className="py-2 border-b-2">
        <Link
          to={ROUTES.INBOX}
          className="p-2"
          aria-label="Go to inbox">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <TaskSidebarNavGroup
          currentPath={pathname}
          taskCounts={taskCounts}
          handleMobileNavigation={handleMobileNavigation}
        />
        <ProjectsSidebarSection handleMobileNavigation={handleMobileNavigation} />
      </SidebarContent>
      <SidebarFooter>
        <UserChip />
      </SidebarFooter>
    </Sidebar>
  );
};
