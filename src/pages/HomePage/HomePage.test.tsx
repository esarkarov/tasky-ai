import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

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

vi.mock('@/shared/constants/routes', () => ({
  ROUTES: {
    TODAY: '/today',
    REGISTER: '/register',
  },
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render page with main content', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should set document title', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      expect(document.title).toBe('Tasky AI | AI-Powered Task Management App');
    });

    it('should render page title with AI-Powered highlight', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      expect(screen.getByText(/Simplify Your Work and Life with/i)).toBeInTheDocument();
      expect(screen.getByText('AI-Powered')).toBeInTheDocument();
      expect(screen.getByText(/Task Management/i)).toBeInTheDocument();
    });

    it('should render description text', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      expect(
        screen.getByText(/Simplify life for both you and your team with the AI powered task manager/i)
      ).toBeInTheDocument();
    });

    it('should render hero images', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      const mobileImage = screen.getByAltText('Illustration of Tasky AI app interface on mobile');
      const desktopImage = screen.getByAltText('Illustration of Tasky AI app interface on desktop');

      expect(mobileImage).toHaveAttribute('src', '/banner/hero-banner-sm.png');
      expect(desktopImage).toHaveAttribute('src', '/banner/hero-banner-lg.png');
    });
  });

  describe('user not signed in', () => {
    it('should show "Get Started" button', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      const getStartedLink = screen.getByRole('link', { name: 'Create your Tasky AI account' });
      expect(getStartedLink).toBeInTheDocument();
      expect(getStartedLink).toHaveAttribute('href', '/register');
    });

    it('should not show "Go to Dashboard" button', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      expect(screen.queryByRole('link', { name: 'Go to your dashboard' })).not.toBeInTheDocument();
    });

    it('should navigate to register page when Get Started is clicked', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      const getStartedLink = screen.getByRole('link', { name: 'Create your Tasky AI account' });
      await user.click(getStartedLink);

      expect(getStartedLink).toHaveAttribute('href', '/register');
    });

    it('should render complete page for signed out user', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByLabelText('App description')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create your Tasky AI account' })).toBeInTheDocument();
      expect(screen.getByAltText(/Tasky AI app interface on mobile/i)).toBeInTheDocument();
      expect(screen.getByAltText(/Tasky AI app interface on desktop/i)).toBeInTheDocument();
    });
  });

  describe('user signed in', () => {
    it('should show "Go to Dashboard" button', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: true });

      renderComponent();

      const dashboardLink = screen.getByRole('link', { name: 'Go to your dashboard' });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/today');
    });

    it('should not show "Get Started" button', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: true });

      renderComponent();

      expect(screen.queryByRole('link', { name: 'Create your Tasky AI account' })).not.toBeInTheDocument();
    });

    it('should navigate to dashboard when Go to Dashboard is clicked', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({ isSignedIn: true });

      renderComponent();

      const dashboardLink = screen.getByRole('link', { name: 'Go to your dashboard' });
      await user.click(dashboardLink);

      expect(dashboardLink).toHaveAttribute('href', '/today');
    });

    it('should render complete page for signed in user', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: true });

      renderComponent();

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByLabelText('App description')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to your dashboard' })).toBeInTheDocument();
      expect(screen.getByAltText(/Tasky AI app interface on mobile/i)).toBeInTheDocument();
      expect(screen.getByAltText(/Tasky AI app interface on desktop/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have correct aria-labelledby on main section', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-labelledby', 'homepage-heading');
    });

    it('should have aria-label on description paragraph', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      const description = screen.getByLabelText('App description');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
    });

    it('should have aria-label on action buttons group', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      const actionsGroup = screen.getByRole('group', { name: 'Primary actions' });
      expect(actionsGroup).toBeInTheDocument();
    });

    it('should have correct heading hierarchy', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      renderComponent();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'homepage-heading');
      expect(heading).toBeInTheDocument();
    });
  });
});
