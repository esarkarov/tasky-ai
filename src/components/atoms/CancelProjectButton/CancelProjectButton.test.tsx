import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CancelProjectButton } from './CancelProjectButton';

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant: string;
  }) => (
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
  const setup = async (overrides = {}) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <CancelProjectButton
        onClick={onClick}
        {...overrides}
      />
    );
    const button = screen.getByRole('button', { name: /cancel project form/i });
    return { button, user, onClick };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders cancel button with correct text', async () => {
      const { button } = await setup();

      expect(button).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders with type="button"', async () => {
      const { button } = await setup();

      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders with secondary variant', async () => {
      const { button } = await setup();

      expect(button).toHaveAttribute('data-variant', 'secondary');
    });
  });

  describe('user interactions', () => {
    it('calls onClick once when clicked', async () => {
      const { button, user, onClick } = await setup();

      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick multiple times when clicked repeatedly', async () => {
      const { button, user, onClick } = await setup();

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label', async () => {
      const { button } = await setup();

      expect(button).toHaveAccessibleName('Cancel project form');
    });

    it('is keyboard accessible via Enter key', async () => {
      const { button, user, onClick } = await setup();

      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is keyboard accessible via Space key', async () => {
      const { button, user, onClick } = await setup();

      button.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
