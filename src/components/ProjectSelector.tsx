import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, Hash, Inbox } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IProjectInfo } from '@/interfaces';

interface ProjectSelectorProps {
  projectInfo: IProjectInfo;
}

export const ProjectSelector = ({ projectInfo }: ProjectSelectorProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      modal
    >
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          role='combobox'
          aria-expanded={isOpen}
          className='max-w-max'
        >
          {projectInfo.name ? <Hash color={projectInfo.colorHex} /> : <Inbox />}
          <span className='truncate'>{projectInfo.name || 'Inbox'}</span>
          <ChevronDown />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-[240px] p-0'
        align='start'
      >
        <Command>
          <CommandInput placeholder='Search project...' />
          <CommandList>
            <ScrollArea>
              <CommandEmpty>No project found.</CommandEmpty>
              <CommandGroup />
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
