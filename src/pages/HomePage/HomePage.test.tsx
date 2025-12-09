import { HomePage } from '@/pages/HomePage/HomePage';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuth = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/shared/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title data-testid="meta-title">{title}</title>,
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => (
    <button
      data-testid="button"
      {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    TODAY: '/today',
    REGISTER: '/register',
  },
}));

describe('HomePage', () => {
  const renderHomePage = (isSignedIn: boolean = false) => {
    mockUseAuth.mockReturnValue({ isSignedIn });
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('common elements', () => {
    it('should render main container with correct aria-labelledby', () => {
      renderHomePage();

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('aria-labelledby', 'homepage-heading');
    });

    it('should set document title to "Tasky AI | AI-Powered Task Management App"', () => {
      renderHomePage();

      expect(document.title).toBe('Tasky AI | AI-Powered Task Management App');
    });

    it('should render page title with AI-Powered highlight', () => {
      renderHomePage();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'homepage-heading');
      expect(screen.getByText(/Simplify Your Work and Life with/i)).toBeInTheDocument();
      expect(screen.getByText('AI-Powered')).toBeInTheDocument();
      expect(screen.getByText(/Task Management/i)).toBeInTheDocument();
    });

    it('should render description with correct aria-label', () => {
      renderHomePage();

      const description = screen.getByLabelText('App description');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
      expect(description).toHaveTextContent(
        /Simplify life for both you and your team with the AI powered task manager/i
      );
    });

    it('should render hero images with correct attributes', () => {
      renderHomePage();

      const mobileImage = screen.getByAltText('Illustration of Tasky AI app interface on mobile');
      const desktopImage = screen.getByAltText('Illustration of Tasky AI app interface on desktop');
      expect(mobileImage).toHaveAttribute('src', '/banner/hero-banner-sm.png');
      expect(desktopImage).toHaveAttribute('src', '/banner/hero-banner-lg.png');
    });

    it('should render action buttons group with aria-label', () => {
      renderHomePage();

      expect(screen.getByRole('group', { name: 'Primary actions' })).toBeInTheDocument();
    });
  });

  describe('signed out user', () => {
    it('should show Get Started button with correct href', () => {
      renderHomePage(false);

      const getStartedLink = screen.getByRole('link', { name: 'Create your Tasky AI account' });
      expect(getStartedLink).toBeInTheDocument();
      expect(getStartedLink).toHaveAttribute('href', '/register');
    });

    it('should not show Go to Dashboard button', () => {
      renderHomePage(false);

      expect(screen.queryByRole('link', { name: 'Go to your dashboard' })).not.toBeInTheDocument();
    });

    it('should maintain href after clicking Get Started button', async () => {
      const user = userEvent.setup();
      renderHomePage(false);
      const getStartedLink = screen.getByRole('link', { name: 'Create your Tasky AI account' });

      await user.click(getStartedLink);

      expect(getStartedLink).toHaveAttribute('href', '/register');
    });
  });

  describe('signed in user', () => {
    it('should show Go to Dashboard button with correct href', () => {
      renderHomePage(true);

      const dashboardLink = screen.getByRole('link', { name: 'Go to your dashboard' });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/today');
    });

    it('should not show Get Started button', () => {
      renderHomePage(true);

      expect(screen.queryByRole('link', { name: 'Create your Tasky AI account' })).not.toBeInTheDocument();
    });

    it('should maintain href after clicking Go to Dashboard button', async () => {
      const user = userEvent.setup();
      renderHomePage(true);
      const dashboardLink = screen.getByRole('link', { name: 'Go to your dashboard' });

      await user.click(dashboardLink);

      expect(dashboardLink).toHaveAttribute('href', '/today');
    });
  });
});
