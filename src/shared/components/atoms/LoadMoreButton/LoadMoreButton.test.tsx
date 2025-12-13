import { LoadMoreButton } from '@/shared/components/atoms/LoadMoreButton/LoadMoreButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react', () => ({
  Loader2: (props: Record<string, unknown>) => (
    <svg
      data-testid="loader-icon"
      {...props}
    />
  ),
}));

describe('LoadMoreButton', () => {
  interface RenderOptions {
    onClick?: () => void;
    loading?: boolean;
  }

  const renderComponent = ({ onClick = vi.fn(), loading = false }: RenderOptions = {}) => {
    return render(
      <LoadMoreButton
        onClick={onClick}
        loading={loading}
      />
    );
  };

  const getButton = () => screen.getByRole('button', { name: /load more tasks/i });
  const getLoaderIcon = () => screen.queryByTestId('loader-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render "Load More" text without loader icon when not loading', () => {
      renderComponent({ loading: false });

      expect(screen.getByText('Load More')).toBeInTheDocument();
      expect(getLoaderIcon()).not.toBeInTheDocument();
    });

    it('should render "Loading..." text with animated loader icon when loading', () => {
      renderComponent({ loading: true });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      const loader = getLoaderIcon();
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveClass('w-4', 'h-4', 'animate-spin');
    });
  });

  describe('state and accessibility', () => {
    it('should be enabled with correct aria-label when not loading', () => {
      renderComponent({ loading: false });

      const button = getButton();
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('aria-label', 'Load more tasks');
    });

    it('should be disabled with correct styling when loading', () => {
      renderComponent({ loading: true });

      const button = getButton();
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when clicked and not loading', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderComponent({ onClick, loading: false });

      await user.click(getButton());

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when clicked while loading', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderComponent({ onClick, loading: true });

      await user.click(getButton());

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should be keyboard accessible and trigger onClick with Enter when not loading', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderComponent({ onClick, loading: false });

      const button = getButton();
      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onClick with Enter when loading', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderComponent({ onClick, loading: true });

      const button = getButton();
      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('component metadata', () => {
    it('should have correct displayName', () => {
      expect(LoadMoreButton.displayName).toBe('LoadMoreButton');
    });

    it('should update when loading state changes', () => {
      const { rerender } = renderComponent({ loading: false });
      expect(screen.getByText('Load More')).toBeInTheDocument();

      rerender(
        <LoadMoreButton
          onClick={vi.fn()}
          loading={true}
        />
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
