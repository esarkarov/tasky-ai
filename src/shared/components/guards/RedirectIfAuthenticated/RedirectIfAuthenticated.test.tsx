import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { RedirectIfAuthenticated } from './RedirectIfAuthenticated';

vi.mock('@/shared/components/atoms/Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>();
  return {
    ...actual,
    Outlet: () => <div data-testid="public-content">Public Content</div>,
    useNavigate: () => mockNavigate,
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
  ROUTES: { DASHBOARD: '/dashboard' },
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
      <RedirectIfAuthenticated />
    </MemoryRouter>
  );

describe('RedirectIfAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render loader when auth is not loaded', () => {
      setupAuth({ isLoaded: false, isSignedIn: false });

      renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should prevent navigation when still loading', () => {
      setupAuth({ isLoaded: false, isSignedIn: true });

      renderComponent();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated user', () => {
    it('should render public content when user is not signed in', () => {
      setupAuth({ isLoaded: true, isSignedIn: false });

      renderComponent();

      expect(screen.getByTestId('public-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    it('should redirect to /dashboard when user is signed in', async () => {
      setupAuth({ isLoaded: true, isSignedIn: true });

      renderComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should render nothing while redirecting', () => {
      setupAuth({ isLoaded: true, isSignedIn: true });

      renderComponent();

      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  describe('state transitions', () => {
    it('should transition from loading to unauthenticated correctly', () => {
      setupAuth({ isLoaded: false, isSignedIn: false });
      const { rerender } = renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth({ isLoaded: true, isSignedIn: false });
      rerender(
        <MemoryRouter>
          <RedirectIfAuthenticated />
        </MemoryRouter>
      );

      expect(screen.getByTestId('public-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should transition from loading to authenticated with redirect', async () => {
      setupAuth({ isLoaded: false, isSignedIn: false });
      const { rerender } = renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth({ isLoaded: true, isSignedIn: true });
      rerender(
        <MemoryRouter>
          <RedirectIfAuthenticated />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });
  });
});
