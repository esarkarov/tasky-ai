import { Logo } from '@/components/atoms/Logo/Logo';
import { UserChip } from '@/components/atoms/UserChip/UserChip';
import { ProjectsSidebarSection } from '@/components/organisms/ProjectsSidebarSection';
import { TaskSidebarNavGroup } from '@/components/organisms/TaskSidebarNavGroup';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { ROUTES } from '@/constants/routes';
import { SidebarLoaderData } from '@/types/loaders.types';
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
