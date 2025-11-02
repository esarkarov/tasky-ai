import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequireAuth } from './RequireAuth';
import { MemoryRouter } from 'react-router';
import { TIMING } from '@/constants/timing';

vi.mock('@/components/atoms/Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

const mockUseNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="protected-content">Protected Content</div>,
    useNavigate: () => mockUseNavigate,
    useLocation: () => ({ pathname: '/protected' }),
  };
});

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockUseAuth = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    LOGIN: '/login',
  },
}));

vi.mock('@/constants/timing', () => ({
  TIMING: {
    TOAST_DURATION: 3000,
  },
}));

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <RequireAuth />
    </MemoryRouter>
  );
};
const setupAuth = (isLoaded: boolean, isSignedIn: boolean) => {
  mockUseAuth.mockReturnValue({ isLoaded, isSignedIn });
};

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loader while authentication is being checked', () => {
      setupAuth(false, false);

      renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should not navigate or show toast while loading', () => {
      setupAuth(false, false);

      renderComponent();

      expect(mockUseNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    it('should render protected content when user is signed in', () => {
      setupAuth(true, true);

      renderComponent();

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should not show toast or redirect when authenticated', () => {
      setupAuth(true, true);

      renderComponent();

      expect(mockUseNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated user', () => {
    it('should redirect to login page when not signed in', async () => {
      setupAuth(true, false);

      renderComponent();

      await waitFor(() => {
        expect(mockUseNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });

    it('should show authentication error toast', async () => {
      setupAuth(true, false);

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
      setupAuth(true, false);

      renderComponent();

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  describe('authentication state', () => {
    it('should transition from loading to authenticated', () => {
      setupAuth(false, false);
      const { rerender } = renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth(true, true);
      rerender(
        <MemoryRouter>
          <RequireAuth />
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should transition from loading to unauthenticated', async () => {
      setupAuth(false, false);
      const { rerender } = renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth(true, false);
      rerender(
        <MemoryRouter>
          <RequireAuth />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockUseNavigate).toHaveBeenCalledWith('/login', { replace: true });
        expect(mockToast).toHaveBeenCalled();
      });
    });
  });
});
