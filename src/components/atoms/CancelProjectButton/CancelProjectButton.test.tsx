import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CancelProjectButton } from './CancelProjectButton';

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: { children: ReactNode; onClick: () => void; variant: string }) => (
    <button
      type="button"
      data-variant={variant}
      onClick={onClick}
      aaria-label="Cancel project form"
      {...props}>
      {children}
    </button>
  ),
}));

describe('CancelProjectButton', () => {
  let mockOnClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClick = vi.fn();
  });

  describe('basic rendering', () => {
    it('should render cancel button with correct text', () => {
      render(<CancelProjectButton onClick={mockOnClick} />);

      expect(screen.getByRole('button', { name: 'Cancel project form' })).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render as a button type', () => {
      render(<CancelProjectButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render with secondary variant', () => {
      render(<CancelProjectButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'secondary');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      render(<CancelProjectButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times when clicked multiple times', async () => {
      const user = userEvent.setup();
      render(<CancelProjectButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      render(<CancelProjectButton onClick={mockOnClick} />);

      expect(screen.getByLabelText('Cancel project form')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<CancelProjectButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be accessible via space key', async () => {
      const user = userEvent.setup();
      render(<CancelProjectButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});
