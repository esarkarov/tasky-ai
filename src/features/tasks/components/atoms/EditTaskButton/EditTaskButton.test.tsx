import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditTaskButton } from './EditTaskButton';

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant: string;
    size: string;
    className: string;
  }) => (
    <button
      type="button"
      aria-label="Edit task"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: { children: React.ReactNode; asChild: boolean }) => (
    <div
      data-testid="tooltip-trigger"
      data-as-child={asChild}>
      {children}
    </div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Edit: (props: Record<string, unknown>) => (
    <svg
      data-testid="edit-icon"
      aria-hidden="true"
      {...props}
    />
  ),
}));

describe('EditTaskButton', () => {
  const setup = async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<EditTaskButton onClick={onClick} />);
    const button = screen.getByRole('button', { name: /edit task/i });
    const icon = screen.getByTestId('edit-icon');
    return { user, onClick, button, icon };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders button with edit icon', async () => {
      const { button, icon } = await setup();

      expect(button).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
    });

    it('renders correct button attributes', async () => {
      const { button } = await setup();

      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-size', 'icon');
    });
  });

  describe('tooltip integration', () => {
    it('renders inside Tooltip component', async () => {
      await setup();

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('renders button as TooltipTrigger with asChild=true', async () => {
      await setup();

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-as-child', 'true');
    });

    it('renders tooltip content with correct text', async () => {
      await setup();

      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveTextContent('Edit task');
    });
  });

  describe('user interactions', () => {
    it('calls onClick when button is clicked', async () => {
      const { user, button, onClick } = await setup();

      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick multiple times when clicked repeatedly', async () => {
      const { user, button, onClick } = await setup();

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('is keyboard accessible via Enter key', async () => {
      const { user, button, onClick } = await setup();

      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label', async () => {
      const { button } = await setup();

      expect(button).toHaveAccessibleName('Edit task');
    });

    it('hides icon from screen readers', async () => {
      const { icon } = await setup();

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
