import { TTaskMode } from '@/types';
import { Button } from '@/components/ui/button';
import { SendHorizonal, X } from 'lucide-react';

interface TaskFormActionsProps {
  mode: TTaskMode;
  isValid: boolean;
  onCancel?: () => void;
  onSubmit: () => void;
}

export const TaskFormActions = ({ mode, isValid, onCancel, onSubmit }: TaskFormActionsProps) => (
  <div className="flex items-center gap-2">
    <Button
      variant="secondary"
      onClick={onCancel}>
      <span className="max-md:hidden">Cancel</span>
      <X className="md:hidden" />
    </Button>

    <Button
      disabled={!isValid}
      onClick={onSubmit}>
      <span className="max-md:hidden">{mode === 'create' ? 'Add task' : 'Save'}</span>
      <SendHorizonal className="md:hidden" />
    </Button>
  </div>
);
