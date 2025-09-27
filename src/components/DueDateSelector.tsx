import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn, formatCustomDate, getTaskDueDateColorClass } from '@/lib/utils';
import { CalendarIcon, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';

interface DueDateSelectorProps {
  dueDate: Date | null;
  onDateChange: (date: Date | null) => void;
  onDateRemove: () => void;
}

export const DueDateSelector = ({
  dueDate,
  onDateChange,
  onDateRemove,
}: DueDateSelectorProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate || null);
    setIsOpen(false);
  };

  return (
    <div className='ring-1 ring-border rounded-md max-w-max'>
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className={cn(getTaskDueDateColorClass(dueDate, false))}
          >
            <CalendarIcon />
            {dueDate ? formatCustomDate(dueDate) : 'Due date'}
          </Button>
        </PopoverTrigger>

        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            disabled={{ before: new Date() }}
            selected={dueDate ? new Date(dueDate) : undefined}
            initialFocus
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      {dueDate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='px-2 -ms-2'
              aria-label='Remove due date'
              onClick={onDateRemove}
            >
              <X />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove due date</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
