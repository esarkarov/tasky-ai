import { AppBarTitle } from '@/shared/components/atoms/AppBarTitle/AppBarTitle';
import { ToggleSidebarButton } from '@/shared/components/atoms/ToggleSidebarButton/ToggleSidebarButton';
import { TIMING } from '@/shared/constants';
import { cn } from '@/shared/utils/ui/ui.utils';
import { useEffect, useState } from 'react';

interface AppTopBarProps {
  label?: string;
  totalCount: number;
  title: string;
}

export const AppTopBar = ({ title, totalCount, label = 'task' }: AppTopBarProps) => {
  const [isTitleVisible, setIsTitleVisible] = useState(false);

  useEffect(() => {
    const listener = () => setIsTitleVisible(window.scrollY > TIMING.SCROLL_THRESHOLD);

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, []);

  return (
    <header
      className={cn(
        'sticky z-40 bg-background top-0 h-14 grid grid-cols-[40px,minmax(0,1fr),40px] items-center px-4',
        isTitleVisible && 'border-b'
      )}
      role="banner"
      aria-label="Application top bar">
      <ToggleSidebarButton />
      <AppBarTitle
        title={title}
        isVisible={isTitleVisible}
        totalCount={totalCount}
        label={label}
      />
    </header>
  );
};
