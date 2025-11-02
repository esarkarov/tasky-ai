import { Button } from '@/components/ui/button';
import { CrudMode } from '@/types/shared.types';
import { SendHorizonal } from 'lucide-react';

interface SubmitTaskButtonProps {
  mode: CrudMode;
  disabled: boolean;
  onClick: () => Promise<void>;
}

export const SubmitTaskButton = ({ mode, disabled, onClick }: SubmitTaskButtonProps) => {
  return (
    <Button
      type="submit"
      aria-label={mode === 'create' ? 'Add task' : 'Save task'}
      onClick={onClick}
      disabled={!disabled}>
      <span className="max-md:hidden">{mode === 'create' ? 'Add' : 'Save'}</span>
      <SendHorizonal
        className="md:hidden"
        aria-hidden="true"
      />
    </Button>
  );
};
