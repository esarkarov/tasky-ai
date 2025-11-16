import { AppTopBar } from '@/shared/components/organisms/AppTopBar/AppTopBar';
import { TIMING } from '@/shared/constants/timing';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/components/atoms/AppBarTitle/AppBarTitle', () => ({
  AppBarTitle: ({
    title,
    isVisible,
    totalCount,
    label,
  }: {
    title: string;
    isVisible: boolean;
    totalCount: number;
    label: string;
  }) => (
    <div
      data-testid="app-bar-title"
      data-visible={isVisible}>
      {title} - {totalCount} {label}(s)
    </div>
  ),
}));

vi.mock('@/shared/components/atoms/ToggleSidebarButton/ToggleSidebarButton', () => ({
  ToggleSidebarButton: () => <button data-testid="toggle-sidebar">Toggle</button>,
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('AppTopBar', () => {
  beforeEach(() => {
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render header with correct structure', () => {
      render(
        <AppTopBar
          title="Inbox"
          totalCount={5}
        />
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByLabelText('Application top bar')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('app-bar-title')).toBeInTheDocument();
    });

    it('should pass correct props to AppBarTitle', () => {
      render(
        <AppTopBar
          title="Today"
          totalCount={3}
          label="item"
        />
      );

      const title = screen.getByTestId('app-bar-title');
      expect(title).toHaveTextContent('Today - 3 item(s)');
    });

    it('should use default label when not provided', () => {
      render(
        <AppTopBar
          title="Inbox"
          totalCount={5}
        />
      );

      expect(screen.getByText(/5 task\(s\)/)).toBeInTheDocument();
    });

    it('should apply base classes to header', () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'z-40', 'bg-background', 'top-0', 'h-14');
    });
  });

  describe('scroll behavior', () => {
    it('should set title invisible initially', () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      const title = screen.getByTestId('app-bar-title');
      expect(title).toHaveAttribute('data-visible', 'false');
    });

    it('should show title when scrolled past threshold', async () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      window.scrollY = TIMING.SCROLL_THRESHOLD + 10;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        const title = screen.getByTestId('app-bar-title');
        expect(title).toHaveAttribute('data-visible', 'true');
      });
    });

    it('should hide title when scrolled back below threshold', async () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      window.scrollY = TIMING.SCROLL_THRESHOLD + 10;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        const title = screen.getByTestId('app-bar-title');
        expect(title).toHaveAttribute('data-visible', 'true');
      });

      window.scrollY = TIMING.SCROLL_THRESHOLD - 10;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        const title = screen.getByTestId('app-bar-title');
        expect(title).toHaveAttribute('data-visible', 'false');
      });
    });

    it('should add border class when title is visible', async () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      const header = screen.getByRole('banner');
      expect(header).not.toHaveClass('border-b');

      window.scrollY = TIMING.SCROLL_THRESHOLD + 10;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(header).toHaveClass('border-b');
      });
    });

    it('should clean up scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={5}
        />
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('aria-label', 'Application top bar');
    });
  });

  describe('different props', () => {
    it('should handle zero count', () => {
      render(
        <AppTopBar
          title="Empty"
          totalCount={0}
          label="item"
        />
      );

      expect(screen.getByText('Empty - 0 item(s)')).toBeInTheDocument();
    });

    it('should handle large count', () => {
      render(
        <AppTopBar
          title="Many"
          totalCount={999}
        />
      );

      expect(screen.getByText('Many - 999 task(s)')).toBeInTheDocument();
    });

    it('should handle custom labels', () => {
      render(
        <AppTopBar
          title="Projects"
          totalCount={10}
          label="project"
        />
      );

      expect(screen.getByText('Projects - 10 project(s)')).toBeInTheDocument();
    });
  });
});
