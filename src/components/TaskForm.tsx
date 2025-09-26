import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatCustomDate, getTaskDueDateColorClass } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';

import { TTaskMode } from '@/types';
import * as chrono from 'chrono-node';
import type { ClassValue } from 'clsx';
import {
  CalendarIcon,
  ChevronDown,
  Hash,
  Inbox,
  SendHorizonal,
  X,
} from 'lucide-react';
import { ITaskForm } from '@/interfaces';

interface TaskFormProps {
  defaultFormData?: ITaskForm;
  className?: ClassValue;
  mode: TTaskMode;
  onCancel?: () => void;
  onSubmit?: (formData: ITaskForm) => void;
}

const DEFAULT_FORM_DATA: ITaskForm = {
  content: '',
  due_date: null,
  project: null,
};

export const TaskForm = ({
  defaultFormData = DEFAULT_FORM_DATA,
  className,
  mode,
  onCancel,
  onSubmit,
}: TaskFormProps) => {
  const [taskContent, setTaskContent] = useState(defaultFormData.content);
  const [dueDate, setDueDate] = useState(defaultFormData.due_date);
  const [projectId, setProjectId] = useState(defaultFormData.project);
  const [projectName, setProjectName] = useState('');
  const [projectColorHex, setProjectColorHex] = useState('');
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (projectId) {
      setProjectName('Project Name');
      setProjectColorHex('#000000');
    }
  }, [projectId]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      content: taskContent,
      due_date: dueDate,
      project: projectId,
    }));
  }, [taskContent, dueDate, projectId]);

  useEffect(() => {
    const chronoParsed = chrono.parse(taskContent);

    if (chronoParsed.length) {
      const lastDate = chronoParsed[chronoParsed.length - 1];

      setDueDate(lastDate.date());
    }
  }, [taskContent]);

  const handleSubmit = useCallback(() => {
    if (!taskContent) return;

    if (onSubmit) onSubmit(formData);

    setTaskContent('');
  }, [taskContent, onSubmit, formData]);

  return (
    <Card className={cn('focus-within:border-foreground/30', className)}>
      <CardContent className='p-2'>
        <Textarea
          className='!border-0 !ring-0 mb-2 p-1'
          placeholder='After finishing the project, Take a tour'
          autoFocus
          value={taskContent}
          onInput={(e) => setTaskContent(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();

              handleSubmit();
            }
          }}
        />

        <div className='ring-1 ring-border rounded-md max-w-max'>
          <Popover
            open={dueDateOpen}
            onOpenChange={setDueDateOpen}
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
                onSelect={(selected) => {
                  setDueDate(selected || null);
                  setDueDateOpen(false);
                }}
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
                  onClick={() => setDueDate(null)}
                >
                  <X />
                </Button>
              </TooltipTrigger>

              <TooltipContent>Remove due date</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className='grid grid-cols-[minmax(0,1fr),max-content] gap-2 p-2'>
        <Popover
          open={projectOpen}
          onOpenChange={setProjectOpen}
          modal
        >
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              role='combobox'
              aria-expanded={projectOpen}
              className='max-w-max'
            >
              {projectName ? <Hash color={projectColorHex} /> : <Inbox />}

              <span className='truncate'>{projectName || 'Inbox'}</span>

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

                  <CommandGroup></CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className='flex items-center gap-2'>
          <Button
            variant='secondary'
            onClick={onCancel}
          >
            <span className='max-md:hidden'>Cancel</span>

            <X className='md:hidden' />
          </Button>

          <Button
            disabled={!taskContent}
            onClick={handleSubmit}
          >
            <span className='max-md:hidden'>
              {mode === 'create' ? 'Add task' : 'Save'}
            </span>

            <SendHorizonal className='md:hidden' />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
