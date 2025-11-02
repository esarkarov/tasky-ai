import { CrudMode } from '@/types/shared.types';
import { Button } from '@/components/ui/button';

interface SubmitProjectButtonProps {
  mode: CrudMode;
  disabled: boolean;
  onClick: () => Promise<void>;
}

export const SubmitProjectButton = ({ mode, disabled, onClick }: SubmitProjectButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={!disabled}
      onClick={onClick}
      aria-label={mode === 'create' ? 'Add project' : 'Save project'}>
      {mode === 'create' ? 'Add' : 'Save'}
    </Button>
  );
};
