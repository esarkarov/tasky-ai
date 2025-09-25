import { SignIn } from '@clerk/clerk-react';
import { Head } from '@/components/Head';
import { PATHS } from '@/constants';

const LoginPage = () => {
  return (
    <>
      <Head title='Log In | AI-Powered Task Management App' />

      <section>
        <div className='container flex justify-center'>
          <SignIn signUpUrl={PATHS.REGISTER} />
        </div>
      </section>
    </>
  );
};

export default LoginPage;
