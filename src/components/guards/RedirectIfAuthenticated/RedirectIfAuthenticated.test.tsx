import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedirectIfAuthenticated } from './RedirectIfAuthenticated';
import { MemoryRouter } from 'react-router';

vi.mock('@/components/atoms/Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="public-content">Public Content</div>,
    useNavigate: () => mockNavigate,
  };
});

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockUseAuth = vi.fn();
const mockUseUser = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockUseAuth(),
  useUser: () => mockUseUser(),
}));

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    TODAY: '/today',
  },
}));

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <RedirectIfAuthenticated />
    </MemoryRouter>
  );
};
const setupAuth = (isLoaded: boolean, isSignedIn: boolean) => {
  mockUseAuth.mockReturnValue({ isLoaded, isSignedIn });
};

describe('RedirectIfAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loader while authentication is being checked', () => {
      setupAuth(false, false);

      renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
    });

    it('should not navigate while loading', () => {
      setupAuth(false, false);

      renderComponent();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated user', () => {
    it('should render public content when user is not signed in', () => {
      setupAuth(true, false);

      renderComponent();

      expect(screen.getByTestId('public-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should not redirect when not authenticated', () => {
      setupAuth(true, false);

      renderComponent();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    it('should redirect to today page when user is signed in', async () => {
      setupAuth(true, true);

      renderComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/today', { replace: true });
      });
    });

    it('should render nothing while redirecting', () => {
      setupAuth(true, true);

      renderComponent();

      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should redirect even without user firstName', async () => {
      setupAuth(true, true);

      renderComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/today', { replace: true });
      });
    });

    it('should redirect even when user is null', async () => {
      setupAuth(true, true);

      renderComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/today', { replace: true });
      });
    });
  });

  describe('authentication state', () => {
    it('should transition from loading to unauthenticated', () => {
      setupAuth(false, false);
      const { rerender } = renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth(true, false);
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
      setupAuth(false, false);
      const { rerender } = renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth(true, true);
      rerender(
        <MemoryRouter>
          <RedirectIfAuthenticated />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/today', { replace: true });
      });
    });
  });
});
