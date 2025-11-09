import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';

export type AddTaskButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export const AddTaskButton = (props: AddTaskButtonProps) => {
  return (
    <Button
      variant="link"
      className="mb-4 justify-start px-0"
      aria-label="Add task"
      {...props}>
      <CirclePlus
        aria-hidden="true"
        focusable="false"
      />
      <span>Add</span>
    </Button>
  );
};
