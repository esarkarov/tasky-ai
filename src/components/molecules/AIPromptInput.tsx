import { InputValueCount } from '@/components/atoms/InputValueCount/InputValueCount';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MAX_PROMPT_LENGTH } from '@/constants/validation';

interface AIPromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const AIPromptInput = ({ value, onChange }: AIPromptInputProps) => {
  return (
    <div className="px-3 pb-3">
      <Label
        htmlFor="ai_prompt"
        className="sr-only">
        AI task prompt
      </Label>
      <Textarea
        id="ai_prompt"
        autoFocus
        placeholder="Tell me about your project. What do you want to accomplish?"
        className="border-none my-2 focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        aria-describedby="ai-task-generator-description"
        aria-invalid={prompt.length > MAX_PROMPT_LENGTH}
      />
      <InputValueCount
        valueLength={prompt.length}
        maxLength={MAX_PROMPT_LENGTH}
      />
    </div>
  );
};
