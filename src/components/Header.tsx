import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { PATHS } from '@/constants';
import { Link, useLocation } from 'react-router';

export const Header = () => {
  const location = useLocation();

  return (
    <header className='fixed z-40 top-0 left-0 w-full p-4'>
      <div className='container h-16 border backdrop-blur-3xl rounded-xl flex justify-between items-center'>
        <Link to={PATHS.HOME}>
          <Logo />
        </Link>

        <div className='flex items-center gap-2'>
          {location.pathname !== PATHS.LOGIN && (
            <Button
              asChild
              variant='ghost'
            >
              <Link to={PATHS.LOGIN}>Sign in</Link>
            </Button>
          )}

          {location.pathname !== PATHS.REGISTER && (
            <Button asChild>
              <Link to={PATHS.REGISTER}>Start for free</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
