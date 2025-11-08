import { type PropsWithChildren, memo } from 'react';

const PageContainer: React.FC<PropsWithChildren> = memo(({ children }) => {
  return (
    <main
      className="container md:max-w-screen-lg"
      role="main"
      aria-label="Page content">
      {children}
    </main>
  );
});

const PageHeader: React.FC<PropsWithChildren> = memo(({ children }) => {
  return (
    <header
      className="pt-2 pb-3 space-y-2 md:px-4 lg:px-10 animate-fade-in opacity-0 [animation-delay:0.1s] [animation-fill-mode:forwards]"
      role="banner"
      aria-label="Page header">
      {children}
    </header>
  );
});

const PageTitle: React.FC<PropsWithChildren> = memo(({ children }) => {
  return (
    <h1
      className="text-2xl font-semibold"
      id="page-title">
      {children}
    </h1>
  );
});

const PageList: React.FC<PropsWithChildren> = memo(({ children }) => {
  return (
    <section
      className="pt-2 pb-20 md:px-4 lg:px-10"
      role="region"
      aria-labelledby="page-title">
      {children}
    </section>
  );
});

PageContainer.displayName = 'PageContainer';
PageTitle.displayName = 'PageTitle';
PageHeader.displayName = 'PageHeader';
PageList.displayName = 'PageList';

export { PageContainer, PageHeader, PageTitle, PageList };
