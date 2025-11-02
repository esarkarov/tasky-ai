import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddTaskButton } from './AddTaskButton';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render button with text and icon', () => {
      render(<AddTaskButton />);

      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByTestId('circle-plus-icon')).toBeInTheDocument();
    });

    it('should render icon before text content', () => {
      render(<AddTaskButton />);

      const button = screen.getByRole('button', { name: 'Add task' });
      const icon = screen.getByTestId('circle-plus-icon');
      const text = screen.getByText('Add');

      expect(button).toContainElement(icon);
      expect(button).toContainElement(text);
    });
  });

  describe('user interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<AddTaskButton onClick={handleClick} />);

      const button = screen.getByRole('button', { name: 'Add task' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();
      render(<AddTaskButton onKeyDown={handleKeyDown} />);

      const button = screen.getByRole('button', { name: 'Add task' });
      button.focus();
      await user.keyboard('{Enter}');

      expect(button).toHaveFocus();
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should handle mouse events', async () => {
      const user = userEvent.setup();
      const handleMouseEnter = vi.fn();
      render(<AddTaskButton onMouseEnter={handleMouseEnter} />);

      const button = screen.getByRole('button', { name: 'Add task' });
      await user.hover(button);

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <AddTaskButton
          onClick={handleClick}
          disabled
        />
      );

      const button = screen.getByRole('button', { name: 'Add task' });
      await user.click(button);

      expect(button).toBeDisabled();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('props handling', () => {
    it('should accept and apply additional HTML button attributes', () => {
      render(
        <AddTaskButton
          id="add-task-button"
          title="Add a new task"
          type="button"
        />
      );

      const button = screen.getByRole('button', { name: 'Add task' });
      expect(button).toHaveAttribute('id', 'add-task-button');
      expect(button).toHaveAttribute('title', 'Add a new task');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should override default aria-label when provided', () => {
      render(<AddTaskButton aria-label="Custom label" />);

      const button = screen.getByRole('button', { name: 'Custom label' });
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should accept data attributes', () => {
      render(<AddTaskButton data-testid="custom-button" />);

      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on button', () => {
      render(<AddTaskButton />);

      const button = screen.getByRole('button', { name: 'Add task' });
      expect(button).toHaveAttribute('aria-label', 'Add task');
    });

    it('should hide icon from screen readers', () => {
      render(<AddTaskButton />);

      const icon = screen.getByTestId('circle-plus-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<AddTaskButton />);

      const button = screen.getByRole('button', { name: 'Add task' });
      await user.tab();

      expect(button).toHaveFocus();
    });
  });
});
