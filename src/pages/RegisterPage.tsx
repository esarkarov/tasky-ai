import { Head } from '@/components/Head';
import { PATHS } from '@/constants';
import { SignUp } from '@clerk/clerk-react';

const RegisterPage = () => {
  return (
    <>
      <Head title='Tasky AI | Create an Account' />

      <section>
        <div className='container flex justify-center'>
          <SignUp signInUrl={PATHS.LOGIN} />
        </div>
      </section>
    </>
  );
};

export default RegisterPage;
