import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmitTaskButton } from './SubmitTaskButton';
import { ReactNode } from 'react';

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'aria-label': ariaLabel,
  }: {
    children: ReactNode;
    onClick: () => void;
    disabled: boolean;
    'aria-label': string;
  }) => (
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
  const setup = (props?: Partial<React.ComponentProps<typeof SubmitTaskButton>>) => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn().mockResolvedValue(undefined);
    const defaultProps = {
      mode: 'create' as const,
      disabled: true,
      onClick: mockOnClick,
      ...props,
    };
    render(<SubmitTaskButton {...defaultProps} />);
    const button = screen.getByRole('button');
    return { user, button, mockOnClick, ...defaultProps };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders "Add" text and correct label in create mode', () => {
      setup({ mode: 'create' });
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByLabelText('Add task')).toBeInTheDocument();
    });

    it('renders "Save" text and correct label in update mode', () => {
      setup({ mode: 'update' });
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByLabelText('Save task')).toBeInTheDocument();
    });
  });

  describe('button attributes', () => {
    it('is of type submit', () => {
      const { button } = setup();
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('is disabled when disabled prop is false', () => {
      const { button } = setup({ disabled: false });
      expect(button).toBeDisabled();
    });

    it('is enabled when disabled prop is true', () => {
      const { button } = setup({ disabled: true });
      expect(button).not.toBeDisabled();
    });
  });

  describe('user interactions', () => {
    it('does not trigger onClick when disabled', async () => {
      const { user, button, mockOnClick } = setup({ disabled: false });
      await user.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('calls onClick when enabled', async () => {
      const { user, button, mockOnClick } = setup({ disabled: true });
      await user.click(button);
      await waitFor(() => expect(mockOnClick).toHaveBeenCalledTimes(1));
    });

    it('handles async onClick correctly', async () => {
      const asyncClick = vi.fn().mockResolvedValue(undefined);
      const { user, button } = setup({ onClick: asyncClick });
      await user.click(button);
      await waitFor(() => expect(asyncClick).toHaveBeenCalledTimes(1));
    });

    it('handles rejected async onClick without crashing', async () => {
      const errorClick = vi.fn().mockRejectedValue(new Error('Failed'));
      const { user, button } = setup({ onClick: errorClick });
      await user.click(button);
      await waitFor(() => expect(errorClick).toHaveBeenCalledTimes(1));
    });
  });

  describe('accessibility', () => {
    it('triggers onClick via Enter key when enabled', async () => {
      const { user, button, mockOnClick } = setup({ disabled: true });
      button.focus();
      await user.keyboard('{Enter}');
      await waitFor(() => expect(mockOnClick).toHaveBeenCalledTimes(1));
    });

    it('triggers onClick via Space key when enabled', async () => {
      const { user, button, mockOnClick } = setup({ disabled: true });
      button.focus();
      await user.keyboard(' ');
      await waitFor(() => expect(mockOnClick).toHaveBeenCalledTimes(1));
    });
  });

  describe('mode transitions', () => {
    it('updates text and label when switching from create to update', () => {
      const { rerender } = render(
        <SubmitTaskButton
          mode="create"
          disabled={true}
          onClick={vi.fn()}
        />
      );
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByLabelText('Add task')).toBeInTheDocument();

      rerender(
        <SubmitTaskButton
          mode="update"
          disabled={true}
          onClick={vi.fn()}
        />
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByLabelText('Save task')).toBeInTheDocument();
    });

    it('updates text and label when switching from update to create', () => {
      const { rerender } = render(
        <SubmitTaskButton
          mode="update"
          disabled={true}
          onClick={vi.fn()}
        />
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByLabelText('Save task')).toBeInTheDocument();

      rerender(
        <SubmitTaskButton
          mode="create"
          disabled={true}
          onClick={vi.fn()}
        />
      );
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByLabelText('Add task')).toBeInTheDocument();
    });
  });

  describe('visual and accessibility checks', () => {
    it('renders send icon consistently across modes', () => {
      const { rerender } = render(
        <SubmitTaskButton
          mode="create"
          disabled={true}
          onClick={vi.fn()}
        />
      );
      expect(screen.getByTestId('send-icon')).toBeInTheDocument();

      rerender(
        <SubmitTaskButton
          mode="update"
          disabled={true}
          onClick={vi.fn()}
        />
      );
      expect(screen.getByTestId('send-icon')).toBeInTheDocument();
    });

    it('hides icon from assistive technologies', () => {
      setup();
      const icon = screen.getByTestId('send-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
