import { RemoveDueDateButton } from '@/shared/components/atoms/RemoveDueDateButton/RemoveDueDateButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
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
  const renderComponent = (onClick = vi.fn()) => {
    return render(<RemoveDueDateButton onClick={onClick} />);
  };

  const getButton = () => screen.getByRole('button', { name: /remove due date/i });
  const getIcon = () => screen.getByTestId('x-icon');
  const getTooltipContent = () => screen.getByTestId('tooltip-content');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render button with correct attributes, icon, and tooltip', () => {
      renderComponent();

      const button = getButton();
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-label', 'Remove due date');
      expect(button).toHaveAccessibleName('Remove due date');

      const icon = getIcon();
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');

      expect(screen.getByTestId('tooltip-trigger')).toHaveAttribute('data-as-child', 'true');
      expect(getTooltipContent()).toHaveTextContent('Remove due date');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderComponent(onClick);

      await user.click(getButton());

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible and trigger onClick with Enter or Space', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderComponent(onClick);

      const button = getButton();
      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });
});
