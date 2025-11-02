import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { X } from 'lucide-react';

interface RemoveDueDateButtonProps {
  onClick: () => void;
}
export const RemoveDueDateButton = ({ onClick }: RemoveDueDateButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2 -ms-2"
          aria-label="Remove due date"
          onClick={onClick}>
          <X aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Remove due date</TooltipContent>
    </Tooltip>
  );
};
