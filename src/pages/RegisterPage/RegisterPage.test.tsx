import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterPage } from './RegisterPage';

vi.mock('@/shared/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title data-testid="meta-title">{title}</title>,
}));

vi.mock('@/shared/constants/routes', () => ({
  ROUTES: {
    TODAY: '/today',
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

  describe('basic rendering', () => {
    it('should render without crashing', () => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render the page title in Head component', () => {
      const title = document.head.querySelector('[data-testid="meta-title"]');
      expect(title!.textContent).toBe('Tasky AI | Create an Account');
    });

    it('should render the SignUp component', () => {
      expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
    });

    it('should render screen reader only heading', () => {
      const heading = screen.getByText('Create a Tasky AI account');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('sr-only');
    });
  });

  describe('component configuration', () => {
    it('should pass correct fallbackRedirectUrl prop to SignUp', () => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackRedirectUrl: '/today',
        })
      );
    });

    it('should pass correct signInUrl prop to SignUp', () => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          signInUrl: '/login',
        })
      );
    });

    it('should pass appearance configuration to SignUp', () => {
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

    it('should pass all required props to SignUp component', () => {
      const signUpProps = mockSignUp.mock.calls[0][0];
      expect(signUpProps).toHaveProperty('signInUrl');
      expect(signUpProps).toHaveProperty('fallbackRedirectUrl');
      expect(signUpProps).toHaveProperty('appearance');
    });
  });

  describe('accessibility', () => {
    it('should have main landmark with correct role', () => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('role', 'main');
    });

    it('should have aria-labelledby pointing to heading id', () => {
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-labelledby', 'register-page-title');
    });

    it('should have heading with correct id for aria-labelledby', () => {
      const heading = screen.getByText('Create a Tasky AI account');
      expect(heading).toHaveAttribute('id', 'register-page-title');
    });

    it('should have screen reader only class on heading', () => {
      const heading = screen.getByText('Create a Tasky AI account');
      expect(heading.tagName).toBe('H1');
      expect(heading).toHaveClass('sr-only');
    });
  });

  describe('component structure', () => {
    it('should render main element containing SignUp component', () => {
      const main = screen.getByRole('main');
      const signUp = screen.getByTestId('clerk-signup');
      expect(main).toContainElement(signUp);
    });

    it('should render heading inside main element', () => {
      const main = screen.getByRole('main');
      const heading = screen.getByText('Create a Tasky AI account');
      expect(main).toContainElement(heading);
    });
  });

  describe('routes integration', () => {
    it('should use ROUTES constants for path configuration', () => {
      const signUpProps = mockSignUp.mock.calls[0][0];
      expect(signUpProps.signInUrl).toBe('/login');
      expect(signUpProps.fallbackRedirectUrl).toBe('/today');
    });
  });
});
