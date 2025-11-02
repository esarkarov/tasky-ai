import { Loader } from '@/components/atoms/Loader/Loader';
import { Toaster } from '@/components/ui/toaster';
import { env } from '@/config/env.config';
import { ROUTES } from '@/constants/routes';
import { router } from '@/router';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router';

const App = () => {
  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      afterSignOutUrl={ROUTES.HOME}
      signInFallbackRedirectUrl={ROUTES.TODAY}
      signUpFallbackRedirectUrl={ROUTES.TODAY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: 'hsl(20 14.3% 4.1%)',
          colorText: 'hsl(60 9.1% 97.8%)',
          colorDanger: 'hsl(0 72.2% 50.6%)',
          colorTextSecondary: 'hsl(24 5.4% 63.9%)',
          colorInputBackground: 'hsl(20 14.3% 4.1%)',
          colorInputText: 'hsl(60 9.1% 97.8%)',
          borderRadius: '0.35rem',
          colorPrimary: 'hsl(20.5 90.2% 48.2%)',
          colorTextOnPrimaryBackground: 'hsl(60 9.1% 97.8%)',
        },
      }}>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster />
    </ClerkProvider>
  );
};

export default App;
