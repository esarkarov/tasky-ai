import { ErrorPage } from '@/pages/ErrorPage/ErrorPage';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseRouteError = vi.fn();
const mockIsRouteErrorResponse = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useRouteError: () => mockUseRouteError(),
    isRouteErrorResponse: (error: unknown) => mockIsRouteErrorResponse(error),
  };
});

vi.mock('@/shared/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, variant, ...props }: { children: ReactNode; variant?: string }) => (
    <button
      data-testid="button"
      data-variant={variant}
      {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    HOME: '/',
    INBOX: '/inbox',
  },
}));

describe('ErrorPage', () => {
  interface ErrorMockSetup {
    is404?: boolean;
  }

  const setupErrorMocks = ({ is404 = false }: ErrorMockSetup = {}) => {
    if (is404) {
      mockUseRouteError.mockReturnValue({ status: 404, statusText: 'Not Found' });
      mockIsRouteErrorResponse.mockReturnValue(true);
    } else {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);
    }
  };

  const renderErrorPage = (setup: ErrorMockSetup = {}) => {
    setupErrorMocks(setup);
    return render(
      <BrowserRouter>
        <ErrorPage />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('common elements', () => {
    it('should render main container with correct aria-labelledby', () => {
      renderErrorPage();

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('aria-labelledby', 'error-page-title');
    });

    it('should set document title to "Tasky AI | Something went wrong"', () => {
      renderErrorPage();

      expect(document.title).toBe('Tasky AI | Something went wrong');
    });

    it('should render both navigation links', () => {
      renderErrorPage();

      expect(screen.getByRole('link', { name: 'Return to Home page' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to your Inbox' })).toBeInTheDocument();
    });

    it('should render action buttons group with aria-label', () => {
      renderErrorPage();

      expect(screen.getByRole('group', { name: 'Error recovery actions' })).toBeInTheDocument();
    });
  });

  describe('404 error state', () => {
    it('should display 404-specific title and message', () => {
      renderErrorPage({ is404: true });

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Hmmm, that page doesn't exist.");
      expect(screen.getByText(/You can get back on track and manage your tasks with ease/i)).toBeInTheDocument();
    });

    it('should display 404 illustration with correct attributes', () => {
      renderErrorPage({ is404: true });

      const image = screen.getByAltText('404 page not found illustration');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/empty-state/page-not-found.png');
    });
  });

  describe('generic error state', () => {
    it('should display generic error title and message', () => {
      renderErrorPage();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong.');
      expect(screen.getByText(/We're working on fixing this issue. Please try again later/i)).toBeInTheDocument();
    });

    it('should display generic error illustration with correct attributes', () => {
      renderErrorPage();

      const image = screen.getByAltText('Generic error illustration');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/empty-state/page-not-found.png');
    });

    it('should have aria-live on error description', () => {
      renderErrorPage();

      const description = screen.getByText(/We're working on fixing this issue/i);
      expect(description).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for home link', () => {
      renderErrorPage();

      const homeLink = screen.getByRole('link', { name: 'Return to Home page' });
      expect(homeLink).toHaveAttribute('href', '/');
      expect(homeLink).toHaveAttribute('aria-label', 'Return to Home page');
    });

    it('should have correct href for inbox link', () => {
      renderErrorPage();

      const inboxLink = screen.getByRole('link', { name: 'Go to your Inbox' });
      expect(inboxLink).toHaveAttribute('href', '/inbox');
      expect(inboxLink).toHaveAttribute('aria-label', 'Go to your Inbox');
    });

    it('should maintain href after clicking home link', async () => {
      const user = userEvent.setup();
      renderErrorPage();
      const homeLink = screen.getByRole('link', { name: 'Return to Home page' });

      await user.click(homeLink);

      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should maintain href after clicking inbox link', async () => {
      const user = userEvent.setup();
      renderErrorPage();
      const inboxLink = screen.getByRole('link', { name: 'Go to your Inbox' });

      await user.click(inboxLink);

      expect(inboxLink).toHaveAttribute('href', '/inbox');
    });
  });

  describe('accessibility', () => {
    it('should have heading with correct id and hierarchy', () => {
      renderErrorPage();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'error-page-title');
      expect(heading).toBeInTheDocument();
    });
  });
});
