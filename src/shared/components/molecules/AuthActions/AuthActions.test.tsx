import { AuthActions } from '@/shared/components/molecules/AuthActions/AuthActions';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const mockUseAuth = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>();
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

vi.mock('@/shared/components/atoms/UserChip/UserChip', () => ({
  UserChip: () => <div data-testid="user-chip">User Chip</div>,
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
}));

interface MockState {
  isSignedIn: boolean;
  pathname: string;
}

const setupMocks = ({ isSignedIn, pathname }: MockState): void => {
  (mockUseAuth as Mock).mockReturnValue({ isSignedIn });
  (mockUseLocation as Mock).mockReturnValue({ pathname });
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <AuthActions />
    </BrowserRouter>
  );

describe('AuthActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signed in user', () => {
    it('should render UserChip when user is signed in', () => {
      setupMocks({ isSignedIn: true, pathname: '/' });

      renderComponent();

      expect(screen.getByTestId('user-chip')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Log in to your account' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Create a new account' })).not.toBeInTheDocument();
    });
  });

  describe('signed out user', () => {
    it('should render both auth buttons on home page', () => {
      setupMocks({ isSignedIn: false, pathname: '/' });

      renderComponent();

      const loginLink = screen.getByRole('link', { name: 'Log in to your account' });
      const signUpLink = screen.getByRole('link', { name: 'Create a new account' });

      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
      expect(loginLink).toHaveAttribute('aria-label', 'Log in to your account');

      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/register');
      expect(signUpLink).toHaveAttribute('aria-label', 'Create a new account');
    });

    it('should hide Log in button on login page', () => {
      setupMocks({ isSignedIn: false, pathname: '/login' });

      renderComponent();

      expect(screen.queryByRole('link', { name: 'Log in to your account' })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create a new account' })).toBeInTheDocument();
    });

    it('should hide Sign Up button on register page', () => {
      setupMocks({ isSignedIn: false, pathname: '/register' });

      renderComponent();

      expect(screen.queryByRole('link', { name: 'Create a new account' })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();
    });

    it('should render both auth buttons on other routes', () => {
      setupMocks({ isSignedIn: false, pathname: '/about' });

      renderComponent();

      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create a new account' })).toBeInTheDocument();
    });
  });

  describe('state transitions', () => {
    it('should update when auth state changes from signed out to signed in', () => {
      setupMocks({ isSignedIn: false, pathname: '/' });
      const { rerender } = renderComponent();

      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();

      setupMocks({ isSignedIn: true, pathname: '/' });
      rerender(
        <BrowserRouter>
          <AuthActions />
        </BrowserRouter>
      );

      expect(screen.getByTestId('user-chip')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Log in to your account' })).not.toBeInTheDocument();
    });

    it('should update when route changes from home to login page', () => {
      setupMocks({ isSignedIn: false, pathname: '/' });
      const { rerender } = renderComponent();

      expect(screen.getByRole('link', { name: 'Log in to your account' })).toBeInTheDocument();

      setupMocks({ isSignedIn: false, pathname: '/login' });
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
