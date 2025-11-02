import { SelectableCommandItem } from '@/components/atoms/SelectableCommandItem/SelectableCommandItem';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectListItem, SelectedProject } from '@/types/projects.types';
import { ChevronDown, Hash, Inbox } from 'lucide-react';
import { useState } from 'react';

interface ProjectPickerProps {
  onValueChange: (project: SelectedProject) => void;
  value: SelectedProject;
  projects: ProjectListItem[];
  disabled: boolean;
}

export const ProjectPicker = ({ value, projects, onValueChange, disabled }: ProjectPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleProjectSelect = (project: ProjectListItem | null) => {
    if (project) {
      const isDeselecting = value.id === project.$id;
      onValueChange({
        id: isDeselecting ? null : project.$id,
        name: isDeselecting ? '' : project.name,
        colorHex: isDeselecting ? '' : project.color_hex,
      });
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Select project"
          className="max-w-max"
          disabled={disabled}>
          {value.name ? (
            <Hash
              color={value.colorHex}
              aria-hidden="true"
            />
          ) : (
            <Inbox aria-hidden="true" />
          )}
          <span className="truncate">{value.name || 'Inbox'}</span>
          <ChevronDown
            className="ml-1"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[240px] p-0"
        align="start"
        role="listbox"
        aria-label="Project list">
        <Command>
          <CommandInput
            placeholder="Search project..."
            aria-label="Search project"
          />
          <CommandList>
            <ScrollArea>
              <CommandEmpty>No project found.</CommandEmpty>
              <CommandGroup>
                {projects?.map((project) => {
                  return (
                    <SelectableCommandItem
                      key={project.$id}
                      id={project.$id}
                      value={`${project.name}=${project.color_hex}`}
                      selected={value.id === project.$id}
                      onSelect={() => handleProjectSelect(project)}
                      icon={
                        <Hash
                          color={project.color_hex}
                          aria-hidden="true"
                        />
                      }
                      label={project.name}
                    />
                  );
                })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
