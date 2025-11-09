import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddTaskButton, AddTaskButtonProps } from './AddTaskButton';

vi.mock('lucide-react', () => ({
  CirclePlus: vi.fn(({ focusable, ...props }) => (
    <svg
      data-testid="circle-plus-icon"
      aria-hidden="true"
      focusable={focusable}
      {...props}
    />
  )),
}));

describe('AddTaskButton', () => {
  const setup = async (props: AddTaskButtonProps = {}) => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const handleKeyDown = vi.fn();
    const handleMouseEnter = vi.fn();
    render(
      <AddTaskButton
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    );
    const button = screen.getByRole('button', { name: /add task/i });
    return { user, button, handleClick, handleKeyDown, handleMouseEnter };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders button with text and icon', async () => {
      const { button } = await setup();

      expect(button).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByTestId('circle-plus-icon')).toBeInTheDocument();
    });

    it('renders icon before text content', async () => {
      const { button } = await setup();
      const icon = screen.getByTestId('circle-plus-icon');
      const text = screen.getByText('Add');

      expect(button).toContainElement(icon);
      expect(button).toContainElement(text);
    });
  });

  describe('user interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const { user, button, handleClick } = await setup();

      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onKeyDown handler when key is pressed', async () => {
      const { user, button, handleKeyDown } = await setup();

      button.focus();
      await user.keyboard('{Enter}');

      expect(button).toHaveFocus();
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('calls onMouseEnter handler when hovered', async () => {
      const { user, button, handleMouseEnter } = await setup();

      await user.hover(button);

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onClick when disabled', async () => {
      const { user, button, handleClick } = await setup({ disabled: true });

      await user.click(button);

      expect(button).toBeDisabled();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('props handling', () => {
    it('applies additional HTML attributes', async () => {
      await setup({
        id: 'add-task-button',
        title: 'Add a new task',
        type: 'button',
      });

      const button = screen.getByRole('button', { name: /add task/i });

      expect(button).toHaveAttribute('id', 'add-task-button');
      expect(button).toHaveAttribute('title', 'Add a new task');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('overrides default aria-label when provided', async () => {
      render(<AddTaskButton aria-label="Custom label" />);
      const button = screen.getByRole('button', { name: /custom label/i });

      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('accessibility', () => {
    it('has correct default aria-label', async () => {
      const { button } = await setup();

      expect(button).toHaveAttribute('aria-label', 'Add task');
    });

    it('hides icon from assistive technologies', async () => {
      await setup();
      const icon = screen.getByTestId('circle-plus-icon');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    });

    it('is keyboard accessible via Tab', async () => {
      const { user } = await setup();

      await user.tab();

      expect(screen.getByRole('button', { name: /add task/i })).toHaveFocus();
    });

    it('is not focusable when disabled', async () => {
      const { user } = await setup({ disabled: true });

      await user.tab();

      expect(screen.getByRole('button', { name: /add task/i })).not.toHaveFocus();
    });
  });
});
