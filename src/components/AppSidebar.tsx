import { Logo } from '@/components/Logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { ROUTES } from '@/constants';
import { IAppLoaderData } from '@/interfaces';
import { Link, useLoaderData, useLocation } from 'react-router';
import { ProjectsSection } from './ProjectsSection';
import { SideNavMenu } from './SideNavMenu';
import { UserButton } from '@clerk/clerk-react';

export const AppSidebar = () => {
  const location = useLocation();
  const { taskCounts } = useLoaderData() as IAppLoaderData;
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigationClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          to={ROUTES.INBOX}
          className="p-2">
          <Logo />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SideNavMenu
          currentPath={location.pathname}
          taskCounts={taskCounts}
          onItemClick={handleNavigationClick}
        />

        <ProjectsSection />
      </SidebarContent>

      <SidebarFooter>
        <UserButton
          showName
          appearance={{
            elements: {
              rootBox: 'w-full',
              userButtonTrigger:
                '!shadow-none w-full justify-start p-2 rounded-md hover:bg-sidebar-accent',
              userButtonBox: 'flex-row-reverse shadow-none gap-2',
              userButtonOuterIdentifier: 'ps-0',
              popoverBox: 'pointer-events-auto',
            },
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
};
