import { AppSidebar } from '@/shared/components/organisms/AppSidebar/AppSidebar';
import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { TIMING } from '@/shared/constants';
import { cn } from '@/shared/utils/ui/ui.utils';
import { memo } from 'react';
import { Outlet, useNavigation } from 'react-router';

export const AppTemplate = memo(() => {
  const { state, formData } = useNavigation();
  const isLoading = state === 'loading' && !formData;

  return (
    <SidebarProvider>
      <TooltipProvider
        delayDuration={TIMING.DELAY_DURATION}
        disableHoverableContent>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main
            id="main-content"
            className={cn(
              'flex-1 focus:outline-none animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:0.2s]',
              isLoading && 'pointer-events-none animate-pulse opacity-50'
            )}
            tabIndex={-1}
            aria-busy={isLoading}
            aria-live="polite">
            <Outlet />
          </main>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
});

AppTemplate.displayName = 'AppTemplate';
