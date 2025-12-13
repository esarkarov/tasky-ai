import { AppTopBar } from '@/shared/components/organisms/AppTopBar/AppTopBar';
import { TIMING } from '@/shared/constants';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface AppBarTitleProps {
  title: string;
  isVisible: boolean;
  totalCount: number;
  label: string;
}

vi.mock('@/shared/components/atoms/AppBarTitle/AppBarTitle', () => ({
  AppBarTitle: ({ title, isVisible, totalCount, label }: AppBarTitleProps) => (
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

  describe('basic rendering', () => {
    it('should render header with all components and correct structure', () => {
      render(
        <AppTopBar
          title="Inbox"
          totalCount={5}
        />
      );

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('aria-label', 'Application top bar');
      expect(header).toHaveClass('sticky', 'z-40', 'bg-background', 'top-0', 'h-14');

      expect(screen.getByTestId('toggle-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('app-bar-title')).toBeInTheDocument();
    });

    it('should pass correct props to AppBarTitle with custom label', () => {
      render(
        <AppTopBar
          title="Today"
          totalCount={3}
          label="item"
        />
      );

      expect(screen.getByText('Today - 3 item(s)')).toBeInTheDocument();
    });

    it('should use default "task" label when not provided', () => {
      render(
        <AppTopBar
          title="Inbox"
          totalCount={5}
        />
      );

      expect(screen.getByText(/5 task\(s\)/)).toBeInTheDocument();
    });

    it('should handle edge case counts correctly', () => {
      const { rerender } = render(
        <AppTopBar
          title="Empty"
          totalCount={0}
          label="item"
        />
      );

      expect(screen.getByText('Empty - 0 item(s)')).toBeInTheDocument();

      rerender(
        <AppTopBar
          title="Many"
          totalCount={999}
        />
      );

      expect(screen.getByText('Many - 999 task(s)')).toBeInTheDocument();
    });
  });

  describe('scroll behavior', () => {
    it('should hide title initially when not scrolled', () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      const title = screen.getByTestId('app-bar-title');
      const header = screen.getByRole('banner');

      expect(title).toHaveAttribute('data-visible', 'false');
      expect(header).not.toHaveClass('border-b');
    });

    it('should show title and border when scrolled past threshold', async () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      window.scrollY = TIMING.SCROLL_THRESHOLD + 10;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(screen.getByTestId('app-bar-title')).toHaveAttribute('data-visible', 'true');
        expect(screen.getByRole('banner')).toHaveClass('border-b');
      });
    });

    it('should hide title and border when scrolled back below threshold', async () => {
      render(
        <AppTopBar
          title="Test"
          totalCount={0}
        />
      );

      window.scrollY = TIMING.SCROLL_THRESHOLD + 10;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(screen.getByTestId('app-bar-title')).toHaveAttribute('data-visible', 'true');
      });

      window.scrollY = TIMING.SCROLL_THRESHOLD - 10;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(screen.getByTestId('app-bar-title')).toHaveAttribute('data-visible', 'false');
        expect(screen.getByRole('banner')).not.toHaveClass('border-b');
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
});
