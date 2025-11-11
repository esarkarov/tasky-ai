import { Head } from '@/shared/components/atoms/Head/Head';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export const ErrorPage = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Head title="Tasky AI | Something went wrong" />
      <main
        role="main"
        className="grow container flex flex-col justify-center items-center pt-23 pb-12"
        aria-labelledby="error-page-title">
        <h1
          id="error-page-title"
          className="text-2xl font-semibold text-center sm:text-4xl">
          {isNotFound ? "Hmmm, that page doesn't exist." : 'Something went wrong.'}
        </h1>

        <p
          className="text-muted-foreground max-w-[55ch] text-center mt-4 mb-6 sm:text-lg"
          aria-live="polite">
          {isNotFound
            ? 'You can get back on track and manage your tasks with ease.'
            : "We're working on fixing this issue. Please try again later."}
        </p>

        <div
          className="flex gap-2"
          role="group"
          aria-label="Error recovery actions">
          <Button asChild>
            <Link
              to={ROUTES.HOME}
              aria-label="Return to Home page">
              Return to Home
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost">
            <Link
              to={ROUTES.INBOX}
              aria-label="Go to your Inbox">
              View Inbox
            </Link>
          </Button>
        </div>

        <figure className="mt-10">
          <img
            src="/empty-state/page-not-found.png"
            width={560}
            height={373}
            alt={isNotFound ? '404 page not found illustration' : 'Generic error illustration'}
          />
        </figure>
      </main>
    </div>
  );
};
