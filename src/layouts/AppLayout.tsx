import { cn } from '@/lib/utils';
import { Outlet, useNavigation } from 'react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from '@/components/AppSidebar';
import { TOOLTIP_DELAY } from '@/constants';

const AppLayout = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading' && !navigation.formData;

  return (
    <>
      <SidebarProvider>
        <TooltipProvider
          delayDuration={TOOLTIP_DELAY}
          disableHoverableContent
        >
          <AppSidebar />

          <main
            className={cn(
              'flex-1',
              isLoading && 'opacity-50 pointer-events-none',
            )}
          >
            <Outlet />
          </main>
        </TooltipProvider>
      </SidebarProvider>

      <Toaster />
    </>
  );
};

export default AppLayout;
