import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title data-testid="meta-title">{title}</title>,
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
  },
}));

const mockSignIn = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  SignIn: (props: Record<string, unknown>) => {
    mockSignIn(props);
    return <div data-testid="clerk-signin">Sign In Component</div>;
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<LoginPage />);
  });

  describe('Rendering', () => {
    it('should render main container with correct aria-labelledby', () => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('aria-labelledby', 'login-page-title');
    });

    it('should set document title to "Tasky AI | Log In"', () => {
      const title = document.head.querySelector('[data-testid="meta-title"]');
      expect(title?.textContent).toBe('Tasky AI | Log In');
    });

    it('should render screen reader only heading with correct id', () => {
      const heading = screen.getByText('Log in to Tasky AI');
      expect(heading.tagName).toBe('H1');
      expect(heading).toHaveAttribute('id', 'login-page-title');
      expect(heading).toHaveClass('sr-only');
    });

    it('should render SignIn component', () => {
      expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
    });
  });

  describe('SignIn Configuration', () => {
    it('should pass correct redirect URLs to SignIn component', () => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackRedirectUrl: '/dashboard',
          signUpUrl: '/register',
        })
      );
    });

    it('should pass appearance configuration to SignIn component', () => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          appearance: expect.objectContaining({
            elements: expect.objectContaining({
              rootBox: 'mx-auto',
              card: 'shadow-lg',
            }),
          }),
        })
      );
    });
  });
});
