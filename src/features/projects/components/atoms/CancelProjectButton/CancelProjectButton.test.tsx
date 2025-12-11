import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CancelProjectButton } from './CancelProjectButton';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant: string;
}

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: ButtonProps) => (
    <button
      type="button"
      data-variant={variant}
      onClick={onClick}
      aria-label="Cancel project form"
      {...props}>
      {children}
    </button>
  ),
}));

describe('CancelProjectButton', () => {
  const mockOnClick = vi.fn();

  const renderComponent = () => {
    render(<CancelProjectButton onClick={mockOnClick} />);
  };

  const getButton = () => screen.getByRole('button', { name: /cancel project form/i });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render button with correct text and attributes', () => {
      renderComponent();

      const button = getButton();
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'secondary');
    });

    it('should have accessible name', () => {
      renderComponent();

      expect(getButton()).toHaveAccessibleName('Cancel project form');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getButton());

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times on repeated clicks', async () => {
      const user = userEvent.setup();
      renderComponent();

      const button = getButton();
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup();
      renderComponent();

      const button = getButton();
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup();
      renderComponent();

      const button = getButton();
      button.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});
