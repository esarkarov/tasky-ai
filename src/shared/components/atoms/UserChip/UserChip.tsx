import { UserButton } from '@clerk/clerk-react';

export const UserChip = () => {
  return (
    <UserButton
      showName
      appearance={{
        elements: {
          rootBox: 'w-full',
          userButtonTrigger:
            '!shadow-none w-full justify-start rounded-md p-2 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          userButtonBox: 'flex-row-reverse gap-2 shadow-none',
          userButtonOuterIdentifier: 'ps-0',
          popoverBox: 'pointer-events-auto',
        },
      }}
      aria-label="User account menu"
    />
  );
};
