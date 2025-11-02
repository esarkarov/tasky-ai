import { Loader2 } from 'lucide-react';
import { memo } from 'react';

export const Loader = memo(() => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background"
      role="status"
      aria-live="polite">
      <img
        src="/logo/logo.svg"
        width={65}
        height={65}
        alt="Tasky AI logo"
        className="select-none"
      />
      <Loader2
        className="animate-spin text-muted-foreground"
        width={35}
        height={35}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
});

Loader.displayName = 'Loader';
