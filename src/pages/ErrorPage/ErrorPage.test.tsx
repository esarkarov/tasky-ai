import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorPage } from './ErrorPage';
import { ReactNode } from 'react';

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

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ErrorPage />
    </BrowserRouter>
  );
};

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render page with main container', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should set document title', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      expect(document.title).toBe('Tasky AI | Something went wrong');
    });

    it('should render action buttons', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      expect(screen.getByRole('link', { name: 'Return to Home page' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to your Inbox' })).toBeInTheDocument();
    });
  });

  describe('404 error rendering', () => {
    it('should display 404 title and message', () => {
      const notFoundError = { status: 404, statusText: 'Not Found' };
      mockUseRouteError.mockReturnValue(notFoundError);
      mockIsRouteErrorResponse.mockReturnValue(true);

      renderComponent();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Hmmm, that page doesn't exist.");
      expect(screen.getByText(/You can get back on track and manage your tasks with ease/i)).toBeInTheDocument();
    });

    it('should display 404 illustration', () => {
      const notFoundError = { status: 404, statusText: 'Not Found' };
      mockUseRouteError.mockReturnValue(notFoundError);
      mockIsRouteErrorResponse.mockReturnValue(true);

      renderComponent();

      const image = screen.getByAltText('404 page not found illustration');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/empty-state/page-not-found.png');
    });

    it('should render complete 404 error page', () => {
      const notFoundError = { status: 404, statusText: 'Not Found' };
      mockUseRouteError.mockReturnValue(notFoundError);
      mockIsRouteErrorResponse.mockReturnValue(true);

      renderComponent();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Hmmm, that page doesn't exist.");
      expect(screen.getByText(/You can get back on track/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Return to Home page' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to your Inbox' })).toBeInTheDocument();
      expect(screen.getByAltText('404 page not found illustration')).toBeInTheDocument();
    });
  });

  describe('generic error rendering', () => {
    it('should display generic error title and message', () => {
      mockUseRouteError.mockReturnValue(new Error('Server error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong.');
      expect(screen.getByText(/We're working on fixing this issue. Please try again later/i)).toBeInTheDocument();
    });

    it('should display generic error illustration', () => {
      mockUseRouteError.mockReturnValue(new Error('Server error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      const image = screen.getByAltText('Generic error illustration');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/empty-state/page-not-found.png');
    });

    it('should render complete generic error page', () => {
      mockUseRouteError.mockReturnValue(new Error('Server error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong.');
      expect(screen.getByText(/We're working on fixing this issue/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Return to Home page' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to your Inbox' })).toBeInTheDocument();
      expect(screen.getByAltText('Generic error illustration')).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should have correct home link href', async () => {
      const user = userEvent.setup();
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      const homeLink = screen.getByRole('link', { name: 'Return to Home page' });
      expect(homeLink).toHaveAttribute('href', '/');

      await user.click(homeLink);
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should have correct inbox link href', async () => {
      const user = userEvent.setup();
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      const inboxLink = screen.getByRole('link', { name: 'Go to your Inbox' });
      expect(inboxLink).toHaveAttribute('href', '/inbox');

      await user.click(inboxLink);
      expect(inboxLink).toHaveAttribute('href', '/inbox');
    });
  });

  describe('accessibility', () => {
    it('should have correct aria-labelledby on main element', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-labelledby', 'error-page-title');
    });

    it('should have aria-live on description paragraph', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      const description = screen.getByText(/We're working on fixing this issue/i);
      expect(description).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-label on action buttons group', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      const actionsGroup = screen.getByRole('group', { name: 'Error recovery actions' });
      expect(actionsGroup).toBeInTheDocument();
    });

    it('should have correct heading hierarchy', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'error-page-title');
      expect(heading).toBeInTheDocument();
    });

    it('should have aria-labels on navigation links', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error'));
      mockIsRouteErrorResponse.mockReturnValue(false);

      renderComponent();

      const homeLink = screen.getByRole('link', { name: 'Return to Home page' });
      const inboxLink = screen.getByRole('link', { name: 'Go to your Inbox' });

      expect(homeLink).toHaveAttribute('aria-label', 'Return to Home page');
      expect(inboxLink).toHaveAttribute('aria-label', 'Go to your Inbox');
    });
  });
});
