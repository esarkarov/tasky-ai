import { Head } from '@/components/atoms/Head/Head';
import { ROUTES } from '@/constants/routes';
import { SignUp } from '@clerk/clerk-react';

export const RegisterPage = () => {
  return (
    <>
      <Head title="Tasky AI | Create an Account" />

      <main
        role="main"
        aria-labelledby="register-page-title"
        className="flex justify-center py-12 animate-fade-in">
        <h1
          id="register-page-title"
          className="sr-only">
          Create a Tasky AI account
        </h1>

        <div className="animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
          <SignUp
            fallbackRedirectUrl={ROUTES.TODAY}
            signInUrl={ROUTES.LOGIN}
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
