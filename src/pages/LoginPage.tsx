import { Head } from '@/components/shared/Head';
import { ROUTES } from '@/constants';
import { SignIn } from '@clerk/clerk-react';

const LoginPage = () => {
  return (
    <>
      <Head title="Tasky AI | Log In" />

      <section>
        <div className="container flex justify-center">
          <SignIn signUpUrl={ROUTES.REGISTER} />
        </div>
      </section>
    </>
  );
};

export default LoginPage;
