import { Button } from '@/shared/components/ui/button';
import { CrudMode } from '@/shared/types';

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
