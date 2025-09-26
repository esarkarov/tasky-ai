import { ClerkProvider } from '@clerk/clerk-react';
import { RouterProvider } from 'react-router';
import { dark } from '@clerk/themes';
import { PATHS } from '@/constants';
import { env } from '@/config/env';
import router from '@/routes';

const App = () => {
  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      afterSignOutUrl={PATHS.AUTH_SYNC}
      signInForceRedirectUrl={PATHS.AUTH_SYNC}
      signUpForceRedirectUrl={PATHS.AUTH_SYNC}
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
      }}
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  );
};

export default App;
