import { AddTaskButton } from '@/features/tasks/components/atoms/AddTaskButton/AddTaskButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react', () => ({
  CirclePlus: ({ ...props }) => (
    <svg
      data-testid="circle-plus-icon"
      aria-hidden="true"
      {...props}
    />
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, className, ...props }: React.ComponentProps<'button'>) => (
    <button
      className={className}
      {...props}>
      {children}
    </button>
  ),
}));

describe('AddTaskButton', () => {
  const mockHandleClick = vi.fn();
  const mockHandleKeyDown = vi.fn();
  const mockHandleMouseEnter = vi.fn();

  interface RenderOptions {
    onClick?: () => void;
    onKeyDown?: () => void;
    onMouseEnter?: () => void;
    disabled?: boolean;
  }

  const renderComponent = ({
    onClick = mockHandleClick,
    onKeyDown = mockHandleKeyDown,
    onMouseEnter = mockHandleMouseEnter,
    disabled = false,
  }: RenderOptions = {}) => {
    return render(
      <AddTaskButton
        onClick={onClick}
        onKeyDown={onKeyDown}
        onMouseEnter={onMouseEnter}
        disabled={disabled}
      />
    );
  };

  const getButton = () => screen.getByRole('button', { name: /add task/i });
  const getIcon = () => screen.getByTestId('circle-plus-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render button with text, icon, and correct structure', () => {
      renderComponent();

      const button = getButton();
      const icon = getIcon();

      expect(button).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
      expect(button).toContainElement(icon);
    });

    it('should have default aria-label', () => {
      renderComponent();

      expect(getButton()).toHaveAttribute('aria-label', 'Add task');
    });

    it('should override aria-label when provided', () => {
      render(<AddTaskButton aria-label="Custom label" />);

      expect(screen.getByRole('button', { name: /custom label/i })).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getButton());

      expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onKeyDown when key is pressed', async () => {
      const user = userEvent.setup();
      renderComponent();

      const button = getButton();
      button.focus();
      await user.keyboard('{Enter}');

      expect(button).toHaveFocus();
      expect(mockHandleKeyDown).toHaveBeenCalled();
    });

    it('should call onMouseEnter when button is hovered', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.hover(getButton());

      expect(mockHandleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is disabled', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      const button = getButton();
      await user.click(button);

      expect(button).toBeDisabled();
      expect(mockHandleClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should hide icon from assistive technologies', () => {
      renderComponent();

      const icon = getIcon();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    });

    it('should be keyboard accessible when enabled', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.tab();

      expect(getButton()).toHaveFocus();
    });

    it('should not be focusable when disabled', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      await user.tab();

      expect(getButton()).not.toHaveFocus();
    });
  });
});
