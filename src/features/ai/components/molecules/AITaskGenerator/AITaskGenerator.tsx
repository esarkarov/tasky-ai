import { AIPromptInput } from '@/features/ai/components/molecules/AIPromptInput/AIPromptInput';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Bot } from 'lucide-react';

export interface AITaskGeneratorProps {
  checked: boolean;
  value: string;
  onCheckedChange: (isEnabled: boolean) => void;
  onValueChange: (value: string) => void;
  disabled: boolean;
}

export const AITaskGenerator = ({ checked, value, onCheckedChange, onValueChange, disabled }: AITaskGeneratorProps) => (
  <section
    className="mt-6 rounded-md border"
    aria-labelledby="ai-task-generator-label">
    <div className="flex items-center gap-3 px-3 py-2">
      <Bot
        className="flex-shrink-0 text-muted-foreground"
        aria-hidden="true"
      />

      <div className="me-auto space-y-0.5">
        <Label
          id="ai-task-generator-label"
          htmlFor="ai_generate"
          className="block text-sm font-medium">
          AI Task Generator
        </Label>
        <p
          id="ai-task-generator-description"
          className="text-xs text-muted-foreground">
          Automatically create tasks by providing a simple prompt.
        </p>
      </div>

      <Switch
        id="ai_generate"
        aria-describedby="ai-task-generator-description"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>

    {checked && (
      <AIPromptInput
        value={value}
        onChange={onValueChange}
      />
    )}
  </section>
);
