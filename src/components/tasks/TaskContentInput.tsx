import { Textarea } from '@/components/ui/textarea';

interface TaskContentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const TaskContentInput = ({ value, onChange, onSubmit }: TaskContentInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Textarea
      className="!border-0 !ring-0 mb-2 p-1"
      placeholder="After finishing the project, Take a tour"
      autoFocus
      value={value}
      onInput={(e) => onChange(e.currentTarget.value)}
      onKeyDown={handleKeyDown}
    />
  );
};
