import { Header } from '@/shared/components/organisms/Header/Header';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/components/atoms/Logo/Logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock('@/shared/components/molecules/AuthActions/AuthActions', () => ({
  AuthActions: () => <div data-testid="auth-actions">Auth Actions</div>,
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    HOME: '/',
  },
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render header with logo, auth actions, and correct structure', () => {
      renderComponent();

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.getByTestId('auth-actions')).toBeInTheDocument();
    });

    it('should render home link with logo and correct attributes', () => {
      renderComponent();

      const homeLink = screen.getByLabelText('Go to home page');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
      expect(homeLink).toContainElement(screen.getByTestId('logo'));
    });
  });
});
