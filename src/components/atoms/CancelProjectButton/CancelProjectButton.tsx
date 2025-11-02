import { Button } from '@/components/ui/button';

interface CancelProjectButtonProps {
  onClick: () => void;
}

export const CancelProjectButton = ({ onClick }: CancelProjectButtonProps) => {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      aria-label="Cancel project form">
      Cancel
    </Button>
  );
};
