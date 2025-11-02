import { AppBarTitle } from '@/components/atoms/AppBarTitle/AppBarTitle';
import { ToggleSidebarButton } from '@/components/atoms/ToggleSidebarButton/ToggleSidebarButton';
import { TIMING } from '@/constants/timing';
import { cn } from '@/utils/ui/ui.utils';
import { useEffect, useState } from 'react';

interface TopAppBarProps {
  label?: string;
  totalCount: number;
  title: string;
}

export const TopAppBar = ({ title, totalCount, label = 'task' }: TopAppBarProps) => {
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
