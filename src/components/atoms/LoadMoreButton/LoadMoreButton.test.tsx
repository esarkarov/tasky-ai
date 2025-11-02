import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadMoreButton } from './LoadMoreButton';

vi.mock('lucide-react', () => ({
  Loader2: (props: Record<string, unknown>) => (
    <svg
      data-testid="loader-icon"
      {...props}
    />
  ),
}));

describe('LoadMoreButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render button with "Load More" text when not loading', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      expect(screen.getByRole('button', { name: 'Load more tasks' })).toBeInTheDocument();
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });

    it('should render button with "Loading..." text when loading', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have correct display name', () => {
      expect(LoadMoreButton.displayName).toBe('LoadMoreButton');
    });
  });

  describe('loading state', () => {
    it('should show loader icon when loading', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('should not show loader icon when not loading', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
    });

    it('should have animate-spin class on loader icon', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      const loader = screen.getByTestId('loader-icon');
      expect(loader).toHaveClass('w-4', 'h-4', 'animate-spin');
    });

    it('should be disabled when loading', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      expect(button).toBeDisabled();
    });

    it('should not be disabled when not loading', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      expect(button).not.toBeDisabled();
    });

    it('should have disabled styling classes', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when clicked and not loading', async () => {
      const user = userEvent.setup();
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup();
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      await user.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should be keyboard accessible when not loading', async () => {
      const user = userEvent.setup();
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      await user.tab();

      expect(button).toHaveFocus();
    });

    it('should trigger onClick on Enter key when not loading', async () => {
      const user = userEvent.setup();
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should not trigger onClick on Enter key when loading', async () => {
      const user = userEvent.setup();
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      expect(button).toHaveAttribute('aria-label', 'Load more tasks');
    });

    it('should indicate loading state to screen readers', () => {
      render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      const button = screen.getByRole('button', { name: 'Load more tasks' });
      expect(button).toBeDisabled();
    });
  });

  describe('memoization', () => {
    it('should not re-render when props are the same', () => {
      const { rerender } = render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Load more tasks' });
      const firstRender = button;

      rerender(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      const secondRender = screen.getByRole('button', { name: 'Load more tasks' });
      expect(firstRender).toBe(secondRender);
    });

    it('should re-render when loading state changes', () => {
      const { rerender } = render(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={false}
        />
      );

      expect(screen.getByText('Load More')).toBeInTheDocument();

      rerender(
        <LoadMoreButton
          onClick={mockOnClick}
          loading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
