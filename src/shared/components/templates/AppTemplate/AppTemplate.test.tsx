import { NavigationState } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppTemplate } from './AppTemplate';

vi.mock('@/shared/components/organisms/AppSidebar/AppSidebar', () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">Sidebar</aside>,
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}));

vi.mock('@/shared/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}));

vi.mock('@/shared/constants/timing', () => ({
  TIMING: { DELAY_DURATION: 500 },
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

const mockUseNavigation = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Page Content</div>,
    useNavigation: () => mockUseNavigation(),
  };
});

const setupNavigation = (state: NavigationState, formData: FormData | null = null) => {
  mockUseNavigation.mockReturnValue({ state, formData });
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <AppTemplate />
    </MemoryRouter>
  );

describe('AppTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupNavigation('idle');
  });

  describe('rendering', () => {
    it('renders sidebar, outlet, and providers', () => {
      renderComponent();

      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders without loading styles when idle', () => {
      setupNavigation('idle');
      renderComponent();
      const main = screen.getByRole('main');

      expect(main).not.toHaveClass('pointer-events-none');
      expect(main).not.toHaveClass('opacity-50');
    });

    it('applies loading styles when navigation is loading without formData', () => {
      setupNavigation('loading');
      renderComponent();
      const main = screen.getByRole('main');

      expect(main).toHaveClass('pointer-events-none');
      expect(main).toHaveClass('opacity-50');
      expect(main).toHaveClass('animate-pulse');
    });

    it('does not apply loading styles when navigation has formData', () => {
      setupNavigation('loading', new FormData());
      renderComponent();
      const main = screen.getByRole('main');

      expect(main).not.toHaveClass('pointer-events-none');
      expect(main).not.toHaveClass('opacity-50');
    });

    it('does not apply loading styles when submitting', () => {
      setupNavigation('submitting');
      renderComponent();
      const main = screen.getByRole('main');

      expect(main).not.toHaveClass('pointer-events-none');
      expect(main).not.toHaveClass('opacity-50');
    });
  });

  describe('accessibility', () => {
    it('sets correct accessibility attributes on main element', () => {
      renderComponent();
      const main = screen.getByRole('main');

      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
      expect(main).toHaveAttribute('aria-live', 'polite');
    });

    it.each([
      { state: 'loading' as NavigationState, expected: 'true' },
      { state: 'idle' as NavigationState, expected: 'false' },
      { state: 'submitting' as NavigationState, expected: 'false' },
    ])('sets aria-busy="$expected" when navigation state is "$state"', ({ state, expected }) => {
      setupNavigation(state);
      renderComponent();
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-busy', expected);
    });
  });

  describe('navigation transitions', () => {
    it.each([
      { state: 'idle' as NavigationState, shouldShowLoading: false },
      { state: 'loading' as NavigationState, shouldShowLoading: true },
      { state: 'submitting' as NavigationState, shouldShowLoading: false },
    ])('handles $state state with loading=$shouldShowLoading correctly', ({ state, shouldShowLoading }) => {
      setupNavigation(state);
      renderComponent();
      const main = screen.getByRole('main');

      expect(main).toHaveAttribute('aria-busy', shouldShowLoading.toString());
      if (shouldShowLoading) {
        expect(main).toHaveClass('pointer-events-none');
        expect(main).toHaveClass('opacity-50');
      } else {
        expect(main).not.toHaveClass('pointer-events-none');
        expect(main).not.toHaveClass('opacity-50');
      }
    });

    it('renders stable layout when re-rendered in same navigation state', () => {
      setupNavigation('idle');
      const { rerender } = renderComponent();
      rerender(
        <MemoryRouter>
          <AppTemplate />
        </MemoryRouter>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });

  describe('component behavior', () => {
    it('has correct displayName', () => {
      expect(AppTemplate.displayName).toBe('AppTemplate');
    });
  });
});
