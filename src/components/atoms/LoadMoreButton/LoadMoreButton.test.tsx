import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadMoreButton, LoadMoreButtonProps } from './LoadMoreButton';

vi.mock('lucide-react', () => ({
  Loader2: (props: Record<string, unknown>) => (
    <svg
      data-testid="loader-icon"
      {...props}
    />
  ),
}));

describe('LoadMoreButton', () => {
  const setup = (props?: Partial<LoadMoreButtonProps>) => {
    const user = userEvent.setup();
    const defaultProps = {
      onClick: vi.fn(),
      loading: false,
      ...props,
    };
    render(<LoadMoreButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /load more tasks/i });
    return { user, button, ...defaultProps };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with "Load More" text when not loading', () => {
      setup();
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });

    it('renders with "Loading..." text when loading', () => {
      setup({ loading: true });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders loader icon when loading', () => {
      setup({ loading: true });
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('does not render loader icon when not loading', () => {
      setup();
      expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
    });

    it('has correct display name', () => {
      expect(LoadMoreButton.displayName).toBe('LoadMoreButton');
    });
  });

  describe('state and styles', () => {
    it('is disabled when loading', () => {
      const { button } = setup({ loading: true });
      expect(button).toBeDisabled();
    });

    it('is not disabled when not loading', () => {
      const { button } = setup();
      expect(button).not.toBeDisabled();
    });

    it('applies disabled styling when loading', () => {
      const { button } = setup({ loading: true });
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('applies spinner classes when loading', () => {
      setup({ loading: true });
      const loader = screen.getByTestId('loader-icon');
      expect(loader).toHaveClass('w-4', 'h-4', 'animate-spin');
    });
  });

  describe('user interactions', () => {
    it('calls onClick when clicked and not loading', async () => {
      const { button, onClick, user } = setup({ loading: false });
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when clicked while loading', async () => {
      const { button, onClick, user } = setup({ loading: true });
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('is keyboard focusable when not loading', async () => {
      const { button, user } = setup({ loading: false });
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('triggers onClick with Enter key when not loading', async () => {
      const user = userEvent.setup();
      const { button, onClick } = setup({ loading: false });
      button.focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onClick with Enter key when loading', async () => {
      const user = userEvent.setup();
      const { button, onClick } = setup({ loading: true });
      button.focus();
      await user.keyboard('{Enter}');
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label', () => {
      const { button } = setup();
      expect(button).toHaveAttribute('aria-label', 'Load more tasks');
    });

    it('announces loading state to screen readers', () => {
      setup({ loading: true });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('does not re-render when props are the same', () => {
      const { rerender } = render(
        <LoadMoreButton
          onClick={vi.fn()}
          loading={false}
        />
      );
      const buttonBefore = screen.getByRole('button', { name: /load more tasks/i });
      rerender(
        <LoadMoreButton
          onClick={vi.fn()}
          loading={false}
        />
      );
      const buttonAfter = screen.getByRole('button', { name: /load more tasks/i });
      expect(buttonBefore).toBe(buttonAfter);
    });

    it('re-renders when loading state changes', () => {
      const { rerender } = render(
        <LoadMoreButton
          onClick={vi.fn()}
          loading={false}
        />
      );
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
