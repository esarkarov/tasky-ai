import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoveDueDateButton } from './RemoveDueDateButton';
import { ReactNode } from 'react';

vi.mock('lucide-react', () => ({
  X: (props: Record<string, unknown>) => (
    <svg
      data-testid="x-icon"
      {...props}
    />
  ),
}));

vi.mock('@/shared/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipTrigger: ({ children, asChild }: { children: ReactNode; asChild?: boolean }) => (
    <div
      data-testid="tooltip-trigger"
      data-as-child={asChild}>
      {children}
    </div>
  ),
}));

describe('RemoveDueDateButton', () => {
  const onClick = vi.fn();
  const setup = async () => {
    const user = userEvent.setup();
    render(<RemoveDueDateButton onClick={onClick} />);
    const button = screen.getByRole('button', { name: /remove due date/i });
    return { user, button };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders button with correct role and label', async () => {
      const { button } = await setup();
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-label', 'Remove due date');
    });

    it('renders X icon inside the button', async () => {
      await setup();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders tooltip trigger and content', async () => {
      await setup();
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Remove due date');
    });

    it('uses "asChild" on tooltip trigger', async () => {
      await setup();
      expect(screen.getByTestId('tooltip-trigger')).toHaveAttribute('data-as-child', 'true');
    });
  });

  describe('user interactions', () => {
    it('calls onClick when clicked', async () => {
      const { user, button } = await setup();
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is keyboard focusable', async () => {
      const { user, button } = await setup();
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('triggers onClick when pressing Enter', async () => {
      const { user, button } = await setup();
      button.focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('triggers onClick when pressing Space', async () => {
      const { user, button } = await setup();
      button.focus();
      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has accessible name matching tooltip and aria-label', async () => {
      const { button } = await setup();
      expect(button).toHaveAccessibleName('Remove due date');
      expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Remove due date');
    });

    it('ensures icon is hidden from assistive technologies', async () => {
      await setup();
      const icon = screen.getByTestId('x-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
