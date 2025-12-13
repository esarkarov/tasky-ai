import { TIMING } from '@/shared/constants';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { RequireAuth } from './RequireAuth';

vi.mock('@/shared/components/atoms/Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>();
  return {
    ...actual,
    Outlet: () => <div data-testid="protected-content">Protected Content</div>,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/protected' }),
  };
});

const mockToast = vi.fn();
vi.mock('@/shared/hooks/use-toast/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockUseAuth = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/shared/constants', () => ({
  TIMING: { TOAST_DURATION: 3000 },
  ROUTES: { LOGIN: '/login' },
}));

interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
}

const setupAuth = ({ isLoaded, isSignedIn }: AuthState): void => {
  (mockUseAuth as Mock).mockReturnValue({ isLoaded, isSignedIn });
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <RequireAuth />
    </MemoryRouter>
  );

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render loader while authentication is loading', () => {
      setupAuth({ isLoaded: false, isSignedIn: false });

      renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should not trigger redirect or toast when still loading', () => {
      setupAuth({ isLoaded: false, isSignedIn: true });

      renderComponent();

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    it('should render protected content when user is signed in', () => {
      setupAuth({ isLoaded: true, isSignedIn: true });

      renderComponent();

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should maintain stability on rerender when user remains authenticated', () => {
      setupAuth({ isLoaded: true, isSignedIn: true });

      const { rerender } = renderComponent();
      rerender(
        <MemoryRouter>
          <RequireAuth />
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated user', () => {
    it('should redirect to login when user is not signed in', async () => {
      setupAuth({ isLoaded: true, isSignedIn: false });

      renderComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });

    it('should show authentication required toast when user is not signed in', async () => {
      setupAuth({ isLoaded: true, isSignedIn: false });

      renderComponent();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Authentication Required',
          description: 'Please sign in to access this page.',
          duration: TIMING.TOAST_DURATION,
        });
      });
    });

    it('should render nothing while redirecting', () => {
      setupAuth({ isLoaded: true, isSignedIn: false });

      renderComponent();

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  describe('state transitions', () => {
    it('should transition from loading to authenticated correctly', () => {
      setupAuth({ isLoaded: false, isSignedIn: false });
      const { rerender } = renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth({ isLoaded: true, isSignedIn: true });
      rerender(
        <MemoryRouter>
          <RequireAuth />
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should transition from loading to unauthenticated with redirect and toast', async () => {
      setupAuth({ isLoaded: false, isSignedIn: false });
      const { rerender } = renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth({ isLoaded: true, isSignedIn: false });
      rerender(
        <MemoryRouter>
          <RequireAuth />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
        expect(mockToast).toHaveBeenCalled();
      });
    });
  });
});
