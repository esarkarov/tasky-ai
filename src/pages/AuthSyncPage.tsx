import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { PATHS } from '@/constants';

const AuthSyncPage = () => {
  const KEY = import.meta.env.VITE_CLERK_USER_STORAGE_KEY;
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      if (localStorage.getItem(KEY)) {
        localStorage.removeItem(KEY);
      }

      navigate(PATHS.HOME);
      return;
    }

    if (isSignedIn) {
      localStorage.setItem(KEY, userId);
      navigate(PATHS.TODAY);
    }
  }, [userId, isSignedIn, isLoaded, navigate, KEY]);

  return <></>;
};

export default AuthSyncPage;
