import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthActions } from './AuthActions';

const mockUseAuth = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

vi.mock('@/components/atoms/UserChip/UserChip', () => ({
  UserChip: () => <div data-testid="user-chip">User Chip</div>,
}));

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AuthActions />
    </BrowserRouter>
  );
};

describe('AuthActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signed in user', () => {
    it('should show UserChip when user is signed in', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: true });
      mockUseLocation.mockReturnValue({ pathname: '/' });

      renderComponent();

      expect(screen.getByTestId('user-chip')).toBeInTheDocument();
    });

    it('should not show Log in button when signed in', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: true });
      mockUseLocation.mockReturnValue({ pathname: '/' });

      renderComponent();

      expect(screen.queryByRole('link', { name: 'Log in to your account' })).not.toBeInTheDocument();
    });

    it('should not show Sign Up button when signed in', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: true });
      mockUseLocation.mockReturnValue({ pathname: '/' });

      renderComponent();

      expect(screen.queryByRole('link', { name: 'Create a new account' })).not.toBeInTheDocument();
    });
  });

  describe('signed out user on home page', () => {
    it('should show both Log in and Sign Up buttons', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/' });

      renderComponent();

      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create a new account' })).toBeInTheDocument();
    });

    it('should have correct hrefs', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/' });

      renderComponent();

      const loginLink = screen.getByRole('link', { name: 'Log in to your account' });
      const signUpLink = screen.getByRole('link', { name: 'Create a new account' });

      expect(loginLink).toHaveAttribute('href', '/login');
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });

  describe('signed out user on login page', () => {
    it('should hide Log in button on login page', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/login' });

      renderComponent();

      expect(screen.queryByRole('link', { name: 'Log in to your account' })).not.toBeInTheDocument();
    });

    it('should show Sign Up button on login page', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/login' });

      renderComponent();

      expect(screen.getByRole('link', { name: 'Create a new account' })).toBeInTheDocument();
    });
  });

  describe('signed out user on register page', () => {
    it('should hide Sign Up button on register page', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/register' });

      renderComponent();

      expect(screen.queryByRole('link', { name: 'Create a new account' })).not.toBeInTheDocument();
    });

    it('should show Log in button on register page', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/register' });

      renderComponent();

      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-labels on auth buttons', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/' });

      renderComponent();

      const loginLink = screen.getByRole('link', { name: 'Log in to your account' });
      const signUpLink = screen.getByRole('link', { name: 'Create a new account' });

      expect(loginLink).toHaveAttribute('aria-label', 'Log in to your account');
      expect(signUpLink).toHaveAttribute('aria-label', 'Create a new account');
    });
  });

  describe('edge cases', () => {
    it('should handle other routes correctly', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/about' });

      renderComponent();

      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create a new account' })).toBeInTheDocument();
    });

    it('should update when auth state changes', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/' });

      const { rerender } = renderComponent();

      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();

      mockUseAuth.mockReturnValue({ isSignedIn: true });
      rerender(
        <BrowserRouter>
          <AuthActions />
        </BrowserRouter>
      );

      expect(screen.getByTestId('user-chip')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Log in to your account' })).not.toBeInTheDocument();
    });

    it('should update when route changes', () => {
      mockUseAuth.mockReturnValue({ isSignedIn: false });
      mockUseLocation.mockReturnValue({ pathname: '/' });

      const { rerender } = renderComponent();

      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();

      mockUseLocation.mockReturnValue({ pathname: '/login' });
      rerender(
        <BrowserRouter>
          <AuthActions />
        </BrowserRouter>
      );

      expect(screen.queryByRole('link', { name: 'Log in to your account' })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create a new account' })).toBeInTheDocument();
    });
  });
});
