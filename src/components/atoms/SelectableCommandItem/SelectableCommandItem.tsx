import { CommandItem } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { ReactNode } from 'react';

interface SelectableCommandItemProps {
  id: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
}

export const SelectableCommandItem = ({ id, value, selected, onSelect, icon, label }: SelectableCommandItemProps) => {
  return (
    <CommandItem
      key={id}
      role="option"
      value={value}
      aria-selected={selected}
      onSelect={onSelect}>
      {icon}
      {label}
      {selected && (
        <Check
          className="ms-auto"
          aria-hidden="true"
        />
      )}
    </CommandItem>
  );
};
