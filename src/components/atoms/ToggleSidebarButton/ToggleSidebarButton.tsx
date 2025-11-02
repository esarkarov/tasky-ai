import { KeyboardShortcut } from '@/components/atoms/KeyboardShortcut/KeyboardShortcut';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
