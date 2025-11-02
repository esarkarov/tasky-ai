import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoveDueDateButton } from './RemoveDueDateButton';
import { ReactNode } from 'react';

vi.mock('lucide-react', () => ({
  X: ({ ...props }) => (
    <svg
      data-testid="x-icon"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
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
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render button', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      expect(screen.getByRole('button', { name: 'Remove due date' })).toBeInTheDocument();
    });

    it('should render X icon', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should render tooltip content', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      expect(screen.getByText('Remove due date')).toBeInTheDocument();
    });

    it('should have type button', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Remove due date' });
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Remove due date' });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Remove due date' });
      await user.tab();

      expect(button).toHaveFocus();
    });

    it('should trigger onClick on Enter key', async () => {
      const user = userEvent.setup();
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Remove due date' });
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should trigger onClick on Space key', async () => {
      const user = userEvent.setup();
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Remove due date' });
      button.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on button', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Remove due date' });
      expect(button).toHaveAttribute('aria-label', 'Remove due date');
    });

    it('should hide icon from screen readers', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const icon = screen.getByTestId('x-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('tooltip', () => {
    it('should render tooltip trigger', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
    });

    it('should render tooltip content with text', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveTextContent('Remove due date');
    });

    it('should use asChild on tooltip trigger', () => {
      render(<RemoveDueDateButton onClick={mockOnClick} />);

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toHaveAttribute('data-as-child', 'true');
    });
  });
});
