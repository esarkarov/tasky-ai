import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ROUTES } from '@/constants';
import { env } from '@/config/env';

const AuthSyncPage = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      if (localStorage.getItem(env.clerkUserStorageKey)) {
        localStorage.removeItem(env.clerkUserStorageKey);
      }

      navigate(ROUTES.HOME);
      return;
    }

    if (isSignedIn) {
      localStorage.setItem(env.clerkUserStorageKey, userId);
      navigate(ROUTES.TODAY);
    }
  }, [userId, isSignedIn, isLoaded, navigate]);

  return <></>;
};

export default AuthSyncPage;
