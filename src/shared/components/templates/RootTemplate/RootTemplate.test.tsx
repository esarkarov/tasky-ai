import { RootTemplate } from '@/shared/components/templates/RootTemplate/RootTemplate';
import { NavigationState } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('@/shared/components/organisms/Header/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/shared/components/organisms/Footer/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

const mockUseNavigation = vi.fn();
vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>();
  return {
    ...actual,
    useNavigation: () => mockUseNavigation(),
    Outlet: () => <div data-testid="outlet">Page Content</div>,
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
      <RootTemplate />
    </MemoryRouter>
  );

describe('RootTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupNavigation({ state: 'idle' });
  });

  describe('basic rendering', () => {
    it('should render header, footer, outlet, and decorative backgrounds', () => {
      const { container } = renderComponent();

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();

      const backgrounds = container.querySelectorAll('[aria-hidden="true"]');
      expect(backgrounds).toHaveLength(2);
      backgrounds.forEach((el) => {
        expect(el).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should have correct layout classes on wrapper', () => {
      const { container } = renderComponent();

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass(
        'relative',
        'isolate',
        'min-h-[100dvh]',
        'flex',
        'flex-col',
        'overflow-hidden',
        'bg-background'
      );
    });

    it('should have displayName', () => {
      expect(RootTemplate.displayName).toBe('RootTemplate');
    });
  });

  describe('loading states', () => {
    it('should set aria-busy to false when idle', () => {
      setupNavigation({ state: 'idle' });

      renderComponent();

      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    });

    it('should set aria-busy to true when loading without formData', () => {
      setupNavigation({ state: 'loading' });

      renderComponent();

      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    });

    it('should set aria-busy to false when loading with formData', () => {
      setupNavigation({ state: 'loading', formData: new FormData() });

      renderComponent();

      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    });

    it('should set aria-busy to false when submitting', () => {
      setupNavigation({ state: 'submitting' });

      renderComponent();

      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
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
      { state: 'idle' as NavigationState, expected: 'false' },
      { state: 'loading' as NavigationState, expected: 'true' },
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
          <RootTemplate />
        </MemoryRouter>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });
});
