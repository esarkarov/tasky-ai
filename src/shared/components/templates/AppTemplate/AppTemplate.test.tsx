import { AppTemplate } from '@/shared/components/templates/AppTemplate/AppTemplate';
import { NavigationState } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

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

vi.mock('@/shared/constants', () => ({
  TIMING: { DELAY_DURATION: 500 },
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

const mockUseNavigation = vi.fn();
vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>();
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Page Content</div>,
    useNavigation: () => mockUseNavigation(),
  };
});

interface NavigationMockState {
  state: NavigationState;
  formData?: FormData | null;
}

const setupNavigation = ({ state, formData = null }: NavigationMockState): void => {
  (mockUseNavigation as Mock).mockReturnValue({ state, formData });
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
    setupNavigation({ state: 'idle' });
  });

  describe('basic rendering', () => {
    it('should render all core components with correct structure', () => {
      renderComponent();

      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have correct displayName', () => {
      expect(AppTemplate.displayName).toBe('AppTemplate');
    });
  });

  describe('loading states', () => {
    it('should not apply loading styles when idle', () => {
      setupNavigation({ state: 'idle' });

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).not.toHaveClass('pointer-events-none', 'opacity-50', 'animate-pulse');
      expect(main).toHaveAttribute('aria-busy', 'false');
    });

    it('should apply loading styles when loading without formData', () => {
      setupNavigation({ state: 'loading' });

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveClass('pointer-events-none', 'opacity-50', 'animate-pulse');
      expect(main).toHaveAttribute('aria-busy', 'true');
    });

    it('should not apply loading styles when loading with formData', () => {
      setupNavigation({ state: 'loading', formData: new FormData() });

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).not.toHaveClass('pointer-events-none', 'opacity-50');
      expect(main).toHaveAttribute('aria-busy', 'false');
    });

    it('should not apply loading styles when submitting', () => {
      setupNavigation({ state: 'submitting' });

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).not.toHaveClass('pointer-events-none', 'opacity-50');
      expect(main).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('accessibility', () => {
    it('should have correct accessibility attributes on main element', () => {
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
    ])('should set aria-busy="$expected" when state is "$state"', ({ state, expected }) => {
      setupNavigation({ state });

      renderComponent();

      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', expected);
    });
  });

  describe('stability', () => {
    it('should maintain stable layout on rerender', () => {
      setupNavigation({ state: 'idle' });

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
});
