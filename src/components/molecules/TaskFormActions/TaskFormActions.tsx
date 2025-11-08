import { CancelTaskButton } from '@/components/atoms/CancelTaskButton/CancelTaskButton';
import { SubmitTaskButton } from '@/components/atoms/SubmitTaskButton/SubmitTaskButton';
import { CrudMode } from '@/types/shared.types';

interface TaskFormActionsProps {
  mode: CrudMode;
  disabled: boolean;
  handleCancel: () => void;
  handleSubmit: () => Promise<void>;
}

export const TaskFormActions = ({ mode, disabled, handleCancel, handleSubmit }: TaskFormActionsProps) => (
  <div
    className="flex items-center gap-2"
    role="group"
    aria-label="Task form actions">
    <CancelTaskButton onClick={handleCancel} />
    <SubmitTaskButton
      mode={mode}
      disabled={disabled}
      onClick={handleSubmit}
    />
  </div>
);
