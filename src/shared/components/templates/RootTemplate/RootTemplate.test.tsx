import { NavigationState } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RootTemplate } from './RootTemplate';

vi.mock('@/shared/components/organisms/Header/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/shared/components/organisms/Footer/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
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

const setupNavigation = (state: NavigationState, formData: FormData | null = null) => {
  mockUseNavigation.mockReturnValue({ state, formData });
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <RootTemplate />
    </MemoryRouter>
  );

describe('RootTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupNavigation('idle');
  });

  describe('rendering', () => {
    it('renders header, footer, and outlet inside main', () => {
      renderComponent();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders decorative background elements', () => {
      const { container } = renderComponent();
      const backgrounds = container.querySelectorAll('[aria-hidden="true"]');
      expect(backgrounds).toHaveLength(2);
      backgrounds.forEach((el) => {
        expect(el).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('has correct animation and layout classes on wrapper', () => {
      const { container } = renderComponent();
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative', 'min-h-[100dvh]', 'flex', 'flex-col', 'bg-background');
    });
  });

  describe('accessibility', () => {
    it('sets main attributes correctly', () => {
      renderComponent();
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
      expect(main).toHaveAttribute('aria-live', 'polite');
    });

    it('updates aria-busy when loading', () => {
      setupNavigation('loading');
      renderComponent();
      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    });

    it('sets aria-busy to false when idle', () => {
      setupNavigation('idle');
      renderComponent();
      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('loading state behavior', () => {
    it('shows loader when loading without formData', () => {
      setupNavigation('loading');
      renderComponent();
      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    });

    it('does not show loader when idle', () => {
      setupNavigation('idle');
      renderComponent();
      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    });

    it('does not show loader when submitting form', () => {
      setupNavigation('submitting');
      renderComponent();
      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    });

    it('does not show loader when formData exists', () => {
      setupNavigation('loading', new FormData());
      renderComponent();
      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('navigation state transitions', () => {
    it.each([
      { state: 'idle' as NavigationState, ariaBusy: 'false' },
      { state: 'loading' as NavigationState, ariaBusy: 'true' },
      { state: 'submitting' as NavigationState, ariaBusy: 'false' },
    ])('updates aria-busy for $state', ({ state, ariaBusy }) => {
      setupNavigation(state);
      renderComponent();
      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', ariaBusy);
    });

    it('renders stable layout between rerenders', () => {
      setupNavigation('idle');
      const { rerender } = renderComponent();
      rerender(
        <MemoryRouter>
          <RootTemplate />
        </MemoryRouter>
      );
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });

  describe('component behavior', () => {
    it('has correct displayName', () => {
      expect(RootTemplate.displayName).toBe('RootTemplate');
    });
  });
});
