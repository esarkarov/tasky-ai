import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { RequireAuth } from './RequireAuth';
import { TIMING } from '@/shared/constants/timing';

vi.mock('@/shared/components/atoms/Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
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

vi.mock('@/shared/constants/routes', () => ({
  ROUTES: { LOGIN: '/login' },
}));

vi.mock('@/shared/constants/timing', () => ({
  TIMING: { TOAST_DURATION: 3000 },
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <RequireAuth />
    </MemoryRouter>
  );
const setupAuth = (isLoaded: boolean, isSignedIn: boolean) => {
  mockUseAuth.mockReturnValue({ isLoaded, isSignedIn });
};

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders loader while authentication is loading', () => {
      setupAuth(false, false);
      renderComponent();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    it('renders protected content when signed in', () => {
      setupAuth(true, true);
      renderComponent();
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated user', () => {
    it('redirects to login when user not signed in', async () => {
      setupAuth(true, false);
      renderComponent();
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true }));
    });

    it('shows authentication required toast', async () => {
      setupAuth(true, false);
      renderComponent();
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Authentication Required',
          description: 'Please sign in to access this page.',
          duration: TIMING.TOAST_DURATION,
        })
      );
    });

    it('renders nothing while redirecting', () => {
      setupAuth(true, false);
      renderComponent();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  describe('state transitions', () => {
    it('transitions from loading to authenticated', () => {
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

    it('transitions from loading to unauthenticated with redirect and toast', async () => {
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
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
        expect(mockToast).toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('does not call navigate or toast if auth is still loading', () => {
      setupAuth(false, true);
      renderComponent();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('handles rerender stability when user remains authenticated', () => {
      setupAuth(true, true);
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
});
