import { INPUT_WARN_THRESHOLD } from '@/shared/constants/validation';
import { cn } from '@/shared/utils/ui/ui.utils';

export interface InputValueCountProps {
  valueLength: number;
  maxLength: number;
  warnAtLength?: number;
}

export const InputValueCount = ({
  valueLength,
  maxLength,
  warnAtLength = maxLength - INPUT_WARN_THRESHOLD,
}: InputValueCountProps) => {
  const isNearLimit = valueLength >= warnAtLength;

  return (
    <div
      id="input-value-count"
      className={cn('ms-auto max-w-max text-xs text-muted-foreground', isNearLimit && 'text-destructive')}
      aria-live="polite">
      {valueLength}/{maxLength}
    </div>
  );
};
