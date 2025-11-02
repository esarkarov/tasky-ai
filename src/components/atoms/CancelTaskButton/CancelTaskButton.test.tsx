import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CancelTaskButton } from './CancelTaskButton';

vi.mock('lucide-react', () => ({
  X: (props: Record<string, unknown>) => (
    <svg
      data-testid="x-icon"
      {...props}
    />
  ),
}));

describe('CancelTaskButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render button with Cancel text', () => {
      render(<CancelTaskButton onClick={mockOnClick} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render X icon', () => {
      render(<CancelTaskButton onClick={mockOnClick} />);

      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should have type button', () => {
      render(<CancelTaskButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Cancel task form' });
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<CancelTaskButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Cancel task form' });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<CancelTaskButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Cancel task form' });
      await user.tab();

      expect(button).toHaveFocus();
    });

    it('should trigger onClick on Enter key', async () => {
      const user = userEvent.setup();
      render(<CancelTaskButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Cancel task form' });
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should trigger onClick on Space key', async () => {
      const user = userEvent.setup();
      render(<CancelTaskButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Cancel task form' });
      button.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label', () => {
      render(<CancelTaskButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Cancel task form' });
      expect(button).toHaveAttribute('aria-label', 'Cancel task form');
    });

    it('should hide icon from screen readers', () => {
      render(<CancelTaskButton onClick={mockOnClick} />);

      const icon = screen.getByTestId('x-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
