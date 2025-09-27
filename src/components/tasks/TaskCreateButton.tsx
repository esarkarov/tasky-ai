import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';

type TaskCreateButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export const TaskCreateButton = (props: TaskCreateButtonProps) => {
  return (
    <Button
      variant="link"
      className="w-full justify-start mb-4 px-0"
      {...props}>
      <CirclePlus /> Add task
    </Button>
  );
};
