import { Head } from '@/shared/components/atoms/Head/Head';
import { ROUTES } from '@/shared/constants';
import { SignIn } from '@clerk/clerk-react';

export const LoginPage = () => {
  return (
    <>
      <Head title="Tasky AI | Log In" />

      <main
        role="main"
        aria-labelledby="login-page-title"
        className="flex justify-center py-12 animate-fade-in">
        <h1
          id="login-page-title"
          className="sr-only">
          Log in to Tasky AI
        </h1>

        <div className="animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
          <SignIn
            fallbackRedirectUrl={ROUTES.TODAY}
            signUpUrl={ROUTES.REGISTER}
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-lg',
              },
            }}
          />
        </div>
      </main>
    </>
  );
};
