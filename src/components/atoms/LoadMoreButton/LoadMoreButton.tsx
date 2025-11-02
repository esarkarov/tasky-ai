import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const LoadMoreButton = memo(({ onClick, loading }: LoadMoreButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Load more tasks">
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>Load More</>
      )}
    </Button>
  );
});

LoadMoreButton.displayName = 'LoadMoreButton';
