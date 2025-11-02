import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RootTemplate } from './RootTemplate';
import { MemoryRouter } from 'react-router';
import { NavigationState } from '@/types/shared.types';

vi.mock('@/components/organisms/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/organisms/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/atoms/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

const mockUseNavigation = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigation: () => mockUseNavigation(),
    Outlet: () => <div data-testid="outlet">Page Content</div>,
  };
});

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <RootTemplate />
    </MemoryRouter>
  );
};
const setupNavigation = (state: NavigationState, formData: FormData | null = null) => {
  mockUseNavigation.mockReturnValue({ state, formData });
};

describe('RootTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupNavigation('idle');
  });

  describe('layout structure', () => {
    it('should render all main layout components', () => {
      renderComponent();

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render two decorative background elements', () => {
      const { container } = renderComponent();

      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements).toHaveLength(2);
    });
  });

  describe('loading state', () => {
    it('should hide loader when idle', () => {
      setupNavigation('idle');

      renderComponent();

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should hide loader when submitting form', () => {
      setupNavigation('submitting');

      renderComponent();

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should hide loader during form data navigation', () => {
      setupNavigation('loading', new FormData());

      renderComponent();

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should configure main landmark with proper attributes', () => {
      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
      expect(main).toHaveAttribute('aria-live', 'polite');
    });

    it('should indicate busy state when loading', () => {
      setupNavigation('loading');

      renderComponent();

      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    });

    it('should indicate ready state when not loading', () => {
      setupNavigation('idle');

      renderComponent();

      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    });

    it('should hide decorative elements from assistive technologies', () => {
      const { container } = renderComponent();

      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
      decorativeElements.forEach((element) => {
        expect(element).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('navigation state', () => {
    it.each([
      { state: 'idle' as const, shouldShowLoader: false, ariaBusy: 'false' },
      { state: 'loading' as const, shouldShowLoader: true, ariaBusy: 'true' },
      { state: 'submitting' as const, shouldShowLoader: false, ariaBusy: 'false' },
    ])('should handle $state state correctly', ({ state, ariaBusy }) => {
      setupNavigation(state);

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-busy', ariaBusy);
    });
  });
});
