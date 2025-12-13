import { CancelTaskButton } from '@/features/tasks/components/atoms/CancelTaskButton/CancelTaskButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react', () => ({
  X: (props: Record<string, unknown>) => (
    <svg
      data-testid="x-icon"
      aria-hidden="true"
      {...props}
    />
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}));

describe('CancelTaskButton', () => {
  const mockOnClick = vi.fn();

  interface RenderOptions {
    onClick?: () => void;
  }

  const renderComponent = ({ onClick = mockOnClick }: RenderOptions = {}) => {
    return render(<CancelTaskButton onClick={onClick} />);
  };

  const getButton = () => screen.getByRole('button', { name: /cancel task form/i });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render button with text, icon, and correct attributes', () => {
      renderComponent();

      const button = getButton();
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-label', 'Cancel task form');
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getButton());

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Enter or Space key is pressed', async () => {
      const user = userEvent.setup();
      renderComponent();

      const button = getButton();
      button.focus();

      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('should be focusable via Tab key', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.tab();

      expect(getButton()).toHaveFocus();
    });
  });

  describe('accessibility', () => {
    it('should hide icon from screen readers', () => {
      renderComponent();

      const icon = screen.getByTestId('x-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
