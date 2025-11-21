import { Loader } from '@/shared/components/atoms/Loader/Loader';
import { ROUTES, TIMING } from '@/shared/constants';
import { useToast } from '@/shared/hooks/use-toast/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

export const RequireAuth = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to access this page.',
        duration: TIMING.TOAST_DURATION,
      });
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate, toast]);

  if (!isLoaded) {
    return <Loader />;
  }

  if (!isSignedIn) {
    return null;
  }

  return <Outlet />;
};
