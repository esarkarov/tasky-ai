import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { Link, useLocation } from 'react-router';

export const Header = () => {
  const location = useLocation();
  const isLogin = location.pathname == ROUTES.LOGIN;
  const isRegister = location.pathname == ROUTES.REGISTER;

  return (
    <header className="fixed z-40 top-0 left-0 w-full p-4">
      <div className="container h-16 border backdrop-blur-3xl rounded-xl flex justify-between items-center">
        <Link to={ROUTES.HOME}>
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          {!isLogin && (
            <Button
              asChild
              variant="ghost">
              <Link to={ROUTES.LOGIN}>Sign in</Link>
            </Button>
          )}

          {!isRegister && (
            <Button asChild>
              <Link to={ROUTES.REGISTER}>Start for free</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
