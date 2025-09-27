import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IProjectInfo } from '@/interfaces';
import { ChevronDown, Hash, Inbox } from 'lucide-react';
import { useState } from 'react';

interface ProjectSelectorProps {
  projectInfo: IProjectInfo;
}

export const ProjectSelector = ({ projectInfo }: ProjectSelectorProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      modal>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={isOpen}
          className="max-w-max">
          {projectInfo.name ? <Hash color={projectInfo.colorHex} /> : <Inbox />}
          <span className="truncate">{projectInfo.name || 'Inbox'}</span>
          <ChevronDown />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[240px] p-0"
        align="start">
        <Command>
          <CommandInput placeholder="Search project..." />
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
