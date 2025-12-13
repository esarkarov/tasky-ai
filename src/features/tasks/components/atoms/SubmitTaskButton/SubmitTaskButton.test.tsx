import { SubmitTaskButton } from '@/features/tasks/components/atoms/SubmitTaskButton/SubmitTaskButton';
import type { CrudMode } from '@/shared/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  'aria-label': string;
}

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel }: ButtonProps) => (
    <button
      type="submit"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  SendHorizonal: ({ className }: { className?: string }) => (
    <svg
      data-testid="send-icon"
      aria-hidden="true"
      className={className}
    />
  ),
}));

describe('SubmitTaskButton', () => {
  const mockOnClick = vi.fn();

  interface RenderOptions {
    mode?: CrudMode;
    disabled?: boolean;
    onClick?: () => Promise<void>;
  }

  const renderComponent = ({ mode = 'create', disabled = true, onClick = mockOnClick }: RenderOptions = {}) => {
    return render(
      <SubmitTaskButton
        mode={mode}
        disabled={disabled}
        onClick={onClick}
      />
    );
  };

  const getButton = () => screen.getByRole('button');
  const getIcon = () => screen.getByTestId('send-icon');

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClick.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('should render button with "Add" text and label in create mode', () => {
      renderComponent({ mode: 'create' });

      expect(getButton()).toHaveAttribute('type', 'submit');
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByLabelText('Add task')).toBeInTheDocument();
    });

    it('should render button with "Save" text and label in update mode', () => {
      renderComponent({ mode: 'update' });

      expect(getButton()).toHaveAttribute('type', 'submit');
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByLabelText('Save task')).toBeInTheDocument();
    });

    it('should render send icon with aria-hidden', () => {
      renderComponent();

      expect(getIcon()).toBeInTheDocument();
      expect(getIcon()).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('disabled state', () => {
    it('should be enabled when disabled prop is true (inverted logic)', () => {
      renderComponent({ disabled: true });

      expect(getButton()).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is false (inverted logic)', () => {
      renderComponent({ disabled: false });

      expect(getButton()).toBeDisabled();
    });
  });

  describe('user interactions', () => {
    it('should call onClick when enabled and clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      await user.click(getButton());

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onClick when disabled and clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: false });

      await user.click(getButton());

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle rejected async onClick without crashing', async () => {
      const user = userEvent.setup();
      const errorClick = vi.fn().mockRejectedValue(new Error('Failed'));
      renderComponent({ onClick: errorClick });

      await user.click(getButton());

      await waitFor(() => {
        expect(errorClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('keyboard interactions', () => {
    it('should call onClick with Enter and Space keys when enabled', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      const button = getButton();
      button.focus();

      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });

      await user.keyboard(' ');
      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('mode transitions', () => {
    it('should update text and label when mode changes', () => {
      const { rerender } = renderComponent({ mode: 'create' });

      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByLabelText('Add task')).toBeInTheDocument();

      rerender(
        <SubmitTaskButton
          mode="update"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByLabelText('Save task')).toBeInTheDocument();
    });
  });
});
