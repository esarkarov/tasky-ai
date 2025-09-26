import { SignIn } from '@clerk/clerk-react';
import { Head } from '@/components/Head';
import { PATHS } from '@/constants';

const LoginPage = () => {
  return (
    <>
      <Head title='Tasky AI | Log In' />

      <section>
        <div className='container flex justify-center'>
          <SignIn signUpUrl={PATHS.REGISTER} />
        </div>
      </section>
    </>
  );
};

export default LoginPage;
