import { cn } from '@/utils/ui/ui.utils';

interface AppBarTitleProps {
  totalCount: number;
  isVisible: boolean;
  title: string;
  label: string;
}

export const AppBarTitle = ({ totalCount, title, isVisible = true, label }: AppBarTitleProps) => {
  const labelText = `${label}${totalCount !== 1 ? 's' : ''}`;

  return (
    <div
      className={cn(
        'max-w-[480px] mx-auto text-center transition-[transform,opacity]',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      )}>
      <h1
        id="top-app-bar-title"
        className="font-semibold truncate text-base">
        {title}
      </h1>
      {Boolean(totalCount) && (
        <div
          className="text-xs text-muted-foreground"
          aria-live="polite">
          {totalCount} {labelText}
        </div>
      )}
    </div>
  );
};
