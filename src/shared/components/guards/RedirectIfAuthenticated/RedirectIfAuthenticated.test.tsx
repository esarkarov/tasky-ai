import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedirectIfAuthenticated } from './RedirectIfAuthenticated';

vi.mock('@/shared/components/atoms/Loader/Loader', () => ({
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
vi.mock('@/shared/hooks/use-toast/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockUseAuth = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: { TODAY: '/today' },
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <RedirectIfAuthenticated />
    </MemoryRouter>
  );
const setupAuth = (isLoaded: boolean, isSignedIn: boolean) => {
  mockUseAuth.mockReturnValue({ isLoaded, isSignedIn });
};

describe('RedirectIfAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders loader when auth is not loaded', () => {
      setupAuth(false, false);
      renderComponent();

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated user', () => {
    it('renders public content when user is not signed in', () => {
      setupAuth(true, false);
      renderComponent();

      expect(screen.getByTestId('public-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    it('redirects to /today when user is signed in', async () => {
      setupAuth(true, true);
      renderComponent();

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/today', { replace: true }));
    });

    it('renders nothing while redirecting', () => {
      setupAuth(true, true);
      renderComponent();

      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('redirects even if user data is undefined', async () => {
      setupAuth(true, true);
      renderComponent();

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/today', { replace: true }));
    });
  });

  describe('state transitions', () => {
    it('transitions from loading to unauthenticated correctly', () => {
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

    it('transitions from loading to authenticated with redirect', async () => {
      setupAuth(false, false);
      const { rerender } = renderComponent();
      expect(screen.getByTestId('loader')).toBeInTheDocument();

      setupAuth(true, true);
      rerender(
        <MemoryRouter>
          <RedirectIfAuthenticated />
        </MemoryRouter>
      );

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/today', { replace: true }));
    });
  });

  describe('edge cases', () => {
    it('does not break when toast hook is called', () => {
      setupAuth(true, false);
      renderComponent();

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('prevents navigation while still loading', () => {
      setupAuth(false, true);
      renderComponent();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
