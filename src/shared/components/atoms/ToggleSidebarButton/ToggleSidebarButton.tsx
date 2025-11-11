import { KeyboardShortcut } from '@/shared/components/atoms/KeyboardShortcut/KeyboardShortcut';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';

export const ToggleSidebarButton = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger aria-label="Toggle sidebar" />
      </TooltipTrigger>
      <TooltipContent
        className="flex items-center gap-2"
        role="tooltip">
        <p>Toggle sidebar</p>
        <KeyboardShortcut kbdList={['Ctrl', 'B']} />
      </TooltipContent>
    </Tooltip>
  );
};
