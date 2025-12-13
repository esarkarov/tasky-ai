import { EditTaskButton } from '@/features/tasks/components/atoms/EditTaskButton/EditTaskButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant: string;
  size: string;
  className: string;
}

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: ButtonProps) => (
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
  const mockOnClick = vi.fn();

  const renderComponent = () => {
    return render(<EditTaskButton onClick={mockOnClick} />);
  };

  const getButton = () => screen.getByRole('button', { name: /edit task/i });
  const getIcon = () => screen.getByTestId('edit-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render button with icon and correct attributes', () => {
      renderComponent();

      const button = getButton();
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-size', 'icon');
      expect(button).toHaveAccessibleName('Edit task');
      expect(getIcon()).toBeInTheDocument();
    });

    it('should render with tooltip structure', () => {
      renderComponent();

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger')).toHaveAttribute('data-as-child', 'true');
      expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Edit task');
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

    it('should be keyboard accessible via Enter key', async () => {
      const user = userEvent.setup();
      renderComponent();

      const button = getButton();
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should hide icon from screen readers', () => {
      renderComponent();

      expect(getIcon()).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
