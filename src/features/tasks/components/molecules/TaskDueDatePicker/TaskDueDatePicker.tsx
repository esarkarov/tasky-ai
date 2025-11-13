import { RemoveDueDateButton } from '@/shared/components/atoms/RemoveDueDateButton/RemoveDueDateButton';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { useDisclosure } from '@/shared/hooks/use-disclosure';
import { formatCustomDate } from '@/shared/utils/date/date.utils';
import { cn, getTaskDueDateColorClass } from '@/shared/utils/ui/ui.utils';
import { CalendarIcon } from 'lucide-react';

interface TaskDueDatePickerProps {
  dueDate: Date | null;
  disabled: boolean;
  handleDateSelect: (date: Date | null) => void;
  handleDateRemove: () => void;
}

export const TaskDueDatePicker = ({
  dueDate,
  disabled,
  handleDateSelect,
  handleDateRemove,
}: TaskDueDatePickerProps) => {
  const { isOpen: open, setIsOpen: onOpenChange, close: closeSelect } = useDisclosure();
  const onDateSelect = (selectedDate: Date | undefined) => {
    handleDateSelect(selectedDate || null);
    closeSelect();
  };

  return (
    <div
      className="max-w-max rounded-md ring-1 ring-border"
      aria-label="Due date selector">
      <Popover
        open={open}
        onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="due-date-calendar"
            className={cn(getTaskDueDateColorClass(dueDate, false))}
            disabled={disabled}>
            <CalendarIcon aria-hidden="true" />
            <span className="ml-1">{dueDate ? formatCustomDate(dueDate) : 'Due date'}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          id="due-date-calendar"
          className="w-auto p-0"
          role="dialog"
          aria-label="Select due date">
          <Calendar
            mode="single"
            disabled={{ before: new Date() }}
            selected={dueDate ? new Date(dueDate) : undefined}
            onSelect={onDateSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {dueDate && <RemoveDueDateButton onClick={handleDateRemove} />}
    </div>
  );
};
