import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CancelTaskButtonProps {
  onClick: () => void;
}

export const CancelTaskButton = ({ onClick }: CancelTaskButtonProps) => {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      aria-label="Cancel task form">
      <span className="max-md:hidden">Cancel</span>
      <X
        className="md:hidden"
        aria-hidden="true"
      />
    </Button>
  );
};
