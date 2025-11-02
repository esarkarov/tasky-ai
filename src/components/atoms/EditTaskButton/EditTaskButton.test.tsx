import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditTaskButton } from './EditTaskButton';
import { ReactNode } from 'react';

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
  }: {
    children: ReactNode;
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

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: { children: ReactNode; asChild: boolean }) => (
    <div
      data-testid="tooltip-trigger"
      data-as-child={asChild}>
      {children}
    </div>
  ),
  TooltipContent: ({ children }: { children: ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Edit: ({ ...props }) => (
    <svg
      data-testid="edit-icon"
      aria-hidden="true"
      {...props}
    />
  ),
}));

describe('EditTaskButton', () => {
  let mockOnClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClick = vi.fn();
  });

  describe('basic rendering', () => {
    it('should render button with edit icon', () => {
      render(<EditTaskButton onClick={mockOnClick} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    });

    it('should render as button type', () => {
      render(<EditTaskButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render with ghost variant and icon size', () => {
      render(<EditTaskButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-size', 'icon');
    });
  });

  describe('tooltip', () => {
    it('should render within tooltip wrapper', () => {
      render(<EditTaskButton onClick={mockOnClick} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render button as tooltip trigger', () => {
      render(<EditTaskButton onClick={mockOnClick} />);

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-as-child', 'true');
    });

    it('should render tooltip content with correct text', () => {
      render(<EditTaskButton onClick={mockOnClick} />);

      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toBeInTheDocument();
      expect(tooltipContent).toHaveTextContent('Edit task');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditTaskButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times when clicked multiple times', async () => {
      const user = userEvent.setup();
      render(<EditTaskButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      render(<EditTaskButton onClick={mockOnClick} />);

      expect(screen.getByLabelText('Edit task')).toBeInTheDocument();
    });

    it('should hide icon from screen readers', () => {
      render(<EditTaskButton onClick={mockOnClick} />);

      const icon = screen.getByTestId('edit-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be keyboard accessible via Enter key', async () => {
      const user = userEvent.setup();
      render(<EditTaskButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});
