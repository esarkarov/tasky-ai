import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CancelTaskButton, CancelTaskButtonProps } from './CancelTaskButton';

vi.mock('lucide-react', () => ({
  X: (props: Record<string, unknown>) => (
    <svg
      data-testid="x-icon"
      aria-hidden="true"
      {...props}
    />
  ),
}));

describe('CancelTaskButton', () => {
  const setup = async (overrides: Partial<CancelTaskButtonProps> = {}) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <CancelTaskButton
        onClick={onClick}
        {...overrides}
      />
    );
    const button = screen.getByRole('button', { name: /cancel task form/i });
    return { user, button, onClick };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('eendering', () => {
    it('renders cancel text and X icon', async () => {
      const { button } = await setup();

      expect(button).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('has correct button type', async () => {
      const { button } = await setup();

      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('user interactions', () => {
    it('calls onClick when clicked', async () => {
      const { user, button, onClick } = await setup();

      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is focusable via keyboard navigation (Tab)', async () => {
      const { user, button } = await setup();

      await user.tab();

      expect(button).toHaveFocus();
    });

    it('triggers onClick on Enter key press', async () => {
      const { user, button, onClick } = await setup();

      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('triggers onClick on Space key press', async () => {
      const { user, button, onClick } = await setup();

      button.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for assistive technologies', async () => {
      const { button } = await setup();

      expect(button).toHaveAttribute('aria-label', 'Cancel task form');
    });

    it('hides icon from screen readers', async () => {
      await setup();
      const icon = screen.getByTestId('x-icon');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
