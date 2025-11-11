import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmitProjectButton } from './SubmitProjectButton';

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
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

describe('SubmitProjectButton', () => {
  let mockOnClick: ReturnType<typeof vi.fn>;
  const setup = (props?: Partial<React.ComponentProps<typeof SubmitProjectButton>>) => {
    const user = userEvent.setup();
    mockOnClick = vi.fn().mockResolvedValue(undefined);
    const defaultProps = {
      mode: 'create' as const,
      disabled: true,
      onClick: mockOnClick,
      ...props,
    };
    render(<SubmitProjectButton {...defaultProps} />);
    const button = screen.getByRole('button');
    return { user, button, ...defaultProps };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders "Add" text and "Add project" label in create mode', () => {
      setup({ mode: 'create' });
      expect(screen.getByRole('button')).toHaveTextContent('Add');
      expect(screen.getByLabelText('Add project')).toBeInTheDocument();
    });

    it('renders "Save" text and "Save project" label in update mode', () => {
      setup({ mode: 'update' });
      expect(screen.getByRole('button')).toHaveTextContent('Save');
      expect(screen.getByLabelText('Save project')).toBeInTheDocument();
    });
  });

  describe('button attributes', () => {
    it('has submit type', () => {
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
    it('does not call onClick when disabled', async () => {
      const { user, button } = setup({ disabled: false });
      await user.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('calls onClick when enabled', async () => {
      const { user, button } = setup({ disabled: true });
      await user.click(button);
      await waitFor(() => expect(mockOnClick).toHaveBeenCalledTimes(1));
    });

    it('handles async onClick without errors', async () => {
      const asyncClick = vi.fn().mockResolvedValue(undefined);
      const { user, button } = setup({ onClick: asyncClick });
      await user.click(button);
      await waitFor(() => expect(asyncClick).toHaveBeenCalledTimes(1));
    });

    it('handles rejected onClick gracefully', async () => {
      const errorClick = vi.fn().mockRejectedValue(new Error('Submit failed'));
      const { user, button } = setup({ onClick: errorClick });
      await user.click(button);
      await waitFor(() => expect(errorClick).toHaveBeenCalledTimes(1));
    });
  });

  describe('accessibility', () => {
    it('triggers onClick via Enter key when enabled', async () => {
      const { user, button } = setup({ disabled: true });
      button.focus();
      await user.keyboard('{Enter}');
      await waitFor(() => expect(mockOnClick).toHaveBeenCalledTimes(1));
    });

    it('triggers onClick via Space key when enabled', async () => {
      const { user, button } = setup({ disabled: true });
      button.focus();
      await user.keyboard(' ');
      await waitFor(() => expect(mockOnClick).toHaveBeenCalledTimes(1));
    });
  });

  describe('mode transitions', () => {
    it('updates from create → update', () => {
      const { rerender } = render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Add');
      expect(screen.getByLabelText('Add project')).toBeInTheDocument();

      rerender(
        <SubmitProjectButton
          mode="update"
          disabled={true}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Save');
      expect(screen.getByLabelText('Save project')).toBeInTheDocument();
    });

    it('updates from update → create', () => {
      const { rerender } = render(
        <SubmitProjectButton
          mode="update"
          disabled={true}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Save');
      expect(screen.getByLabelText('Save project')).toBeInTheDocument();

      rerender(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Add');
      expect(screen.getByLabelText('Add project')).toBeInTheDocument();
    });
  });
});
