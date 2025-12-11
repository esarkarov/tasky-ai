import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmitProjectButton } from './SubmitProjectButton';
import type { CrudMode } from '@/shared/types';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  'aria-label': string;
}
interface RenderOptions {
  mode?: CrudMode;
  disabled?: boolean;
  onClick?: () => Promise<void>;
}

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel, ...props }: ButtonProps) => (
    <button
      type="submit"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      {...props}>
      {children}
    </button>
  ),
}));

describe('SubmitProjectButton', () => {
  const mockOnClick = vi.fn().mockResolvedValue(undefined);

  const renderComponent = ({ mode = 'create', disabled = true, onClick = mockOnClick }: RenderOptions = {}) => {
    render(
      <SubmitProjectButton
        mode={mode}
        disabled={disabled}
        onClick={onClick}
      />
    );
  };

  const getButton = () => screen.getByRole('button');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render "Add" text with correct label in create mode', () => {
      renderComponent({ mode: 'create' });

      const button = getButton();
      expect(button).toHaveTextContent('Add');
      expect(button).toHaveAccessibleName('Add project');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render "Save" text with correct label in update mode', () => {
      renderComponent({ mode: 'update' });

      const button = getButton();
      expect(button).toHaveTextContent('Save');
      expect(button).toHaveAccessibleName('Save project');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is false', () => {
      renderComponent({ disabled: false });

      expect(getButton()).toBeDisabled();
    });

    it('should be enabled when disabled prop is true', () => {
      renderComponent({ disabled: true });

      expect(getButton()).not.toBeDisabled();
    });
  });

  describe('user interactions', () => {
    it('should not call onClick when button is disabled', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: false });

      await user.click(getButton());

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should call onClick when button is enabled', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      await user.click(getButton());

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle async onClick that resolves', async () => {
      const user = userEvent.setup();
      const asyncClick = vi.fn().mockResolvedValue(undefined);
      renderComponent({ onClick: asyncClick });

      await user.click(getButton());

      expect(asyncClick).toHaveBeenCalledTimes(1);
    });

    it('should handle async onClick that rejects', async () => {
      const user = userEvent.setup();
      const errorClick = vi.fn().mockRejectedValue(new Error('Submit failed'));
      renderComponent({ onClick: errorClick });

      await user.click(getButton());

      expect(errorClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard accessibility', () => {
    it('should call onClick when Enter key is pressed on enabled button', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      const button = getButton();
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed on enabled button', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      const button = getButton();
      button.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('mode transitions', () => {
    it('should update content when mode changes from create to update', () => {
      const { rerender } = render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(getButton()).toHaveTextContent('Add');
      expect(getButton()).toHaveAccessibleName('Add project');

      rerender(
        <SubmitProjectButton
          mode="update"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(getButton()).toHaveTextContent('Save');
      expect(getButton()).toHaveAccessibleName('Save project');
    });

    it('should update content when mode changes from update to create', () => {
      const { rerender } = render(
        <SubmitProjectButton
          mode="update"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(getButton()).toHaveTextContent('Save');
      expect(getButton()).toHaveAccessibleName('Save project');

      rerender(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(getButton()).toHaveTextContent('Add');
      expect(getButton()).toHaveAccessibleName('Add project');
    });
  });
});
