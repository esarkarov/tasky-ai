import { Footer } from '@/shared/components/organisms/Footer/Footer';
import { Header } from '@/shared/components/organisms/Header/Header';
import { memo } from 'react';
import { Outlet, useNavigation } from 'react-router';

export const RootTemplate = memo(() => {
  const { state, formData } = useNavigation();
  const isLoading = state === 'loading' && !formData;

  return (
    <div className="relative isolate min-h-[100dvh] flex flex-col overflow-hidden bg-background">
      <Header />

      <main
        id="main-content"
        className="grow grid grid-cols-1 items-center pt-36 pb-24 md:pt-40 md:pb-28 animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]"
        tabIndex={-1}
        aria-busy={isLoading}
        aria-live="polite">
        <Outlet />
      </main>

      <div className="animate-fade-in opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards]">
        <Footer />
      </div>

      <div
        className="absolute top-20 left-0 h-[500px] w-[500px] origin-top-left rotate-45 bg-primary/15 blur-[140px] pointer-events-none animate-pulse"
        aria-hidden="true"
      />
      <div
        className="absolute top-20 right-0 h-[500px] w-[500px] origin-top-right -rotate-45 bg-orange-500/15 blur-[140px] pointer-events-none animate-pulse"
        style={{ animationDelay: '1s' }}
        aria-hidden="true"
      />
    </div>
  );
});

RootTemplate.displayName = 'RootTemplate';
