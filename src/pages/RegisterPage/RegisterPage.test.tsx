import { RegisterPage } from '@/pages/RegisterPage/RegisterPage';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title data-testid="meta-title">{title}</title>,
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    DASHBOARD: '/dashboard',
    LOGIN: '/login',
  },
}));

const mockSignUp = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  SignUp: (props: Record<string, unknown>) => {
    mockSignUp(props);
    return <div data-testid="clerk-signup">Sign Up Component</div>;
  },
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<RegisterPage />);
  });

  describe('rendering', () => {
    it('should render main container with correct aria-labelledby', () => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('aria-labelledby', 'register-page-title');
    });

    it('should set document title to "Tasky AI | Create an Account"', () => {
      const title = document.head.querySelector('[data-testid="meta-title"]');
      expect(title?.textContent).toBe('Tasky AI | Create an Account');
    });

    it('should render screen reader only heading with correct id', () => {
      const heading = screen.getByText('Create a Tasky AI account');
      expect(heading.tagName).toBe('H1');
      expect(heading).toHaveAttribute('id', 'register-page-title');
      expect(heading).toHaveClass('sr-only');
    });

    it('should render SignUp component', () => {
      expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
    });
  });

  describe('SignUp configuration', () => {
    it('should pass correct redirect URLs to SignUp component', () => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackRedirectUrl: '/dashboard',
          signInUrl: '/login',
        })
      );
    });

    it('should pass appearance configuration to SignUp component', () => {
      expect(mockSignUp).toHaveBeenCalledWith(
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
