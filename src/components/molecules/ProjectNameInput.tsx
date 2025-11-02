import { InputValueCount } from '@/components/atoms/InputValueCount/InputValueCount';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MAX_NAME_LENGTH } from '@/constants/validation';

interface ProjectNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const ProjectNameInput = ({ value, onChange, disabled }: ProjectNameInputProps) => {
  return (
    <div>
      <Label htmlFor="project_name">Project name</Label>
      <Input
        type="text"
        id="project_name"
        className="mt-2 mb-1"
        placeholder="Enter project name (e.g. Performance Tracker)"
        value={value}
        disabled={disabled}
        maxLength={MAX_NAME_LENGTH}
        onChange={(e) => onChange(e.currentTarget.value)}
        aria-describedby="project-name-count"
        aria-invalid={value.length > MAX_NAME_LENGTH}
      />
      <InputValueCount
        valueLength={value.length}
        maxLength={MAX_NAME_LENGTH}
      />
    </div>
  );
};
