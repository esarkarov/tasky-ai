import { Loader } from '@/shared/components/atoms/Loader/Loader';
import { ROUTES } from '@/shared/constants';
import { useToast } from '@/shared/hooks/use-toast/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

export const RedirectIfAuthenticated = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate, toast]);

  if (!isLoaded) {
    return <Loader />;
  }

  if (isSignedIn) {
    return null;
  }

  return <Outlet />;
};
