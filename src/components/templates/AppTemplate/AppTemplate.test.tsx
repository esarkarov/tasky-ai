import { NavigationState } from '@/types/shared.types';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppTemplate } from './AppTemplate';

vi.mock('@/components/organisms/AppSidebar', () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">Sidebar</aside>,
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) => <div data-testid="sidebar-provider">{children}</div>,
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <div data-testid="tooltip-provider">{children}</div>,
}));

vi.mock('@/constants/timing', () => ({
  TIMING: {
    DELAY_DURATION: 500,
  },
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
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
      <AppTemplate />
    </MemoryRouter>
  );
};
const setupNavigation = (state: NavigationState, formData: FormData | null = null) => {
  mockUseNavigation.mockReturnValue({ state, formData });
};

describe('AppTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupNavigation('idle');
  });

  describe('layout structure', () => {
    it('should render all main layout components', () => {
      renderComponent();

      expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should not apply loading styles when navigation is idle', () => {
      setupNavigation('idle');

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).not.toHaveClass('pointer-events-none');
      expect(main).not.toHaveClass('opacity-50');
    });

    it('should apply loading styles when loading without formData', () => {
      setupNavigation('loading');

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveClass('pointer-events-none');
      expect(main).toHaveClass('opacity-50');
    });

    it('should not apply loading styles when loading with formData', () => {
      setupNavigation('loading', new FormData());

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).not.toHaveClass('pointer-events-none');
      expect(main).not.toHaveClass('opacity-50');
    });

    it('should not apply loading styles when submitting', () => {
      setupNavigation('submitting');

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).not.toHaveClass('pointer-events-none');
      expect(main).not.toHaveClass('opacity-50');
    });

    it('should maintain base classes regardless of loading state', () => {
      setupNavigation('loading');

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1');
      expect(main).toHaveClass('focus:outline-none');
    });
  });

  describe('accessibility', () => {
    it('should have main landmark with correct attributes', () => {
      setupNavigation('idle');

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
      expect(main).toHaveAttribute('aria-busy', 'false');
      expect(main).toHaveAttribute('aria-live', 'polite');
    });

    it.each([
      { state: 'loading' as NavigationState, expected: 'true' },
      { state: 'idle' as NavigationState, expected: 'false' },
      { state: 'submitting' as NavigationState, expected: 'false' },
    ])('should set aria-busy to $expected when state is $state', ({ state, expected }) => {
      setupNavigation(state);

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-busy', expected);
    });

    it('should maintain focus management with tabIndex', () => {
      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('tabIndex', '-1');
    });

    it('should have proper focus outline styles', () => {
      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveClass('focus:outline-none');
    });
  });

  describe('navigation state', () => {
    it.each([
      { state: 'idle' as NavigationState, shouldShowLoading: false },
      { state: 'loading' as NavigationState, shouldShowLoading: true },
      { state: 'submitting' as NavigationState, shouldShowLoading: false },
    ])('should handle $state state correctly', ({ state, shouldShowLoading }) => {
      setupNavigation(state);

      renderComponent();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-busy', shouldShowLoading.toString());

      if (shouldShowLoading) {
        expect(main).toHaveClass('pointer-events-none', 'opacity-50');
      } else {
        expect(main).not.toHaveClass('pointer-events-none');
        expect(main).not.toHaveClass('opacity-50');
      }
    });
  });
});
