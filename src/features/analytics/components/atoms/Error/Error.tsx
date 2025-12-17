import { useNavigate, useRouteError } from 'react-router';

export const Error = () => {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('.', { replace: true });
  };
  const handleGoHome = () => {
    navigate('/app/today');
  };

  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Failed to Load Dashboard</h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || 'An unexpected error occurred while loading analytics data.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
            Go to Today
          </button>
        </div>
      </div>
    </div>
  );
};
