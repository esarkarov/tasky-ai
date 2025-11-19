import { PROJECT_COLORS } from '@/features/projects/constants';
import { SelectableCommandItem } from '@/shared/components/atoms/SelectableCommandItem/SelectableCommandItem';
import { Button } from '@/shared/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from '@/shared/components/ui/command';
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { ChevronDown, Circle } from 'lucide-react';

interface ColorPickerProps {
  open: boolean;
  disabled: boolean;
  value: { name: string; hex: string };
  onOpenChange: (open: boolean) => void;
  handleColorSelect: (value: string) => void;
}

export const ColorPicker = ({ open, onOpenChange, value, handleColorSelect, disabled }: ColorPickerProps) => {
  return (
    <div>
      <Label htmlFor="color">Color</Label>
      <Popover
        modal
        open={open}
        onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="color"
            type="button"
            variant="outline"
            className="w-full mt-2 justify-between"
            aria-haspopup="listbox"
            aria-expanded={open}
            disabled={disabled}
            aria-label={`Select project color (currently ${value.name})`}>
            <Circle
              fill={value.hex}
              aria-hidden="true"
            />
            <span>{value.name}</span>
            <ChevronDown
              className="ms-auto"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="p-0 w-[478px] max-sm:w-[360px]"
          role="listbox"
          aria-label="Available project colors">
          <Command>
            <CommandInput
              placeholder="Search color..."
              aria-label="Search color"
              disabled={disabled}
            />
            <CommandList>
              <ScrollArea>
                <CommandEmpty>No color found.</CommandEmpty>
                <CommandGroup>
                  {PROJECT_COLORS.map(({ name, hex }) => {
                    const defaultValue = `${name}=${hex}`;
                    return (
                      <SelectableCommandItem
                        key={name}
                        id={name}
                        value={defaultValue}
                        selected={value.name === name}
                        onSelect={() => handleColorSelect(defaultValue)}
                        icon={
                          <Circle
                            fill={hex}
                            aria-hidden="true"
                          />
                        }
                        label={name}
                      />
                    );
                  })}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
