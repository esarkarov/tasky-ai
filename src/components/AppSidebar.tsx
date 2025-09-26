import { Logo } from '@/components/Logo';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TaskFormDialog } from '@/components/TaskFormDialog';
import { PATHS, SIDEBAR_LINKS } from '@/constants';
import { UserButton } from '@clerk/clerk-react';
import { ChevronRight, CirclePlus, Plus } from 'lucide-react';
import { Link, useLoaderData, useLocation } from 'react-router';
import { IAppLoaderData } from '@/interfaces';

export const AppSidebar = () => {
  const location = useLocation();
  const { taskCounts } = useLoaderData() as IAppLoaderData;
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          to={PATHS.INBOX}
          className='p-2'
        >
          <Logo />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <TaskFormDialog>
                  <SidebarMenuButton className='!text-primary'>
                    <CirclePlus /> Add task
                  </SidebarMenuButton>
                </TaskFormDialog>
              </SidebarMenuItem>

              {SIDEBAR_LINKS.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <Link to={item.href}>
                      <item.icon />

                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>

                  {item.href === PATHS.INBOX &&
                    Boolean(taskCounts?.inboxTasks) && (
                      <SidebarMenuBadge>
                        {taskCounts?.inboxTasks}
                      </SidebarMenuBadge>
                    )}

                  {item.href === PATHS.TODAY &&
                    Boolean(taskCounts?.todayTasks) && (
                      <SidebarMenuBadge>
                        {taskCounts?.todayTasks}
                      </SidebarMenuBadge>
                    )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Collapsible
          defaultOpen
          className='group/collapsible'
        >
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className='text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            >
              <CollapsibleTrigger>
                <ChevronRight className='me-2 transition-transform group-data-[state=open]/collapsible:rotate-90' />
                Projects
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarGroupAction aria-label='Add project'>
                  <Plus />
                </SidebarGroupAction>
              </TooltipTrigger>

              <TooltipContent side='right'>Add project</TooltipContent>
            </Tooltip>

            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu></SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
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
