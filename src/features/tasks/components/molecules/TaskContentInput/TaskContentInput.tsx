import { InputValueCount } from '@/shared/components/atoms/InputValueCount/InputValueCount';
import { Textarea } from '@/shared/components/ui/textarea';
import { MAX_CONTENT_LENGTH } from '@/shared/constants/validation';

interface TaskContentInputProps {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export const TaskContentInput = ({ value, disabled, onChange }: TaskContentInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="task-content"
        className="sr-only">
        Task description
      </label>

      <Textarea
        id="task-content"
        className="mb-2 p-1"
        placeholder="After finishing the project, take a tour"
        maxLength={MAX_CONTENT_LENGTH}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        aria-label="Task content input"
        aria-multiline="true"
        autoFocus
      />
      <InputValueCount
        valueLength={value.length}
        maxLength={MAX_CONTENT_LENGTH}
      />
      <p className="sr-only">Press Enter to save, Shift+Enter for new line.</p>
    </div>
  );
};
