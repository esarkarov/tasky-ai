import { Head } from '@/components/Head';
import { PATHS } from '@/constants';
import { SignUp } from '@clerk/clerk-react';

const RegisterPage = () => {
  return (
    <>
      <Head title='Create an Account | AI-Powered Task Management App' />

      <section>
        <div className='container flex justify-center'>
          <SignUp signInUrl={PATHS.LOGIN} />
        </div>
      </section>
    </>
  );
};

export default RegisterPage;
