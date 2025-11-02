import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmitProjectButton } from './SubmitProjectButton';

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

describe('SubmitProjectButton', () => {
  let mockOnClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClick = vi.fn().mockResolvedValue(undefined);
  });

  describe('create mode', () => {
    it('should render "Add" text in create mode', () => {
      render(
        <SubmitProjectButton
          mode="create"
          disabled={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Add');
    });

    it('should have "Add project" aria-label in create mode', () => {
      render(
        <SubmitProjectButton
          mode="create"
          disabled={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByLabelText('Add project')).toBeInTheDocument();
    });
  });

  describe('edit mode', () => {
    it('should render "Save" text in edit mode', () => {
      render(
        <SubmitProjectButton
          mode="update"
          disabled={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Save');
    });

    it('should have "Save project" aria-label in edit mode', () => {
      render(
        <SubmitProjectButton
          mode="update"
          disabled={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByLabelText('Save project')).toBeInTheDocument();
    });
  });

  describe('button type', () => {
    it('should render as submit type button', () => {
      render(
        <SubmitProjectButton
          mode="create"
          disabled={false}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is false', () => {
      render(
        <SubmitProjectButton
          mode="create"
          disabled={false}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when disabled prop is true', () => {
      render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should not call onClick when button is disabled', async () => {
      const user = userEvent.setup();
      render(
        <SubmitProjectButton
          mode="create"
          disabled={false}
          onClick={mockOnClick}
        />
      );
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('user interactions', () => {
    it('should call onClick when button is clicked and enabled', async () => {
      const user = userEvent.setup();
      render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );
      const button = screen.getByRole('button');

      await user.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle async onClick in create mode', async () => {
      const user = userEvent.setup();
      const asyncOnClick = vi.fn().mockResolvedValue(undefined);
      render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={asyncOnClick}
        />
      );
      const button = screen.getByRole('button');

      await user.click(button);

      await waitFor(() => {
        expect(asyncOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle async onClick in edit mode', async () => {
      const user = userEvent.setup();
      const asyncOnClick = vi.fn().mockResolvedValue(undefined);
      render(
        <SubmitProjectButton
          mode="update"
          disabled={true}
          onClick={asyncOnClick}
        />
      );
      const button = screen.getByRole('button');

      await user.click(button);

      await waitFor(() => {
        expect(asyncOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle onClick rejection gracefully', async () => {
      const user = userEvent.setup();
      const errorOnClick = vi.fn().mockRejectedValue(new Error('Submit failed'));
      render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={errorOnClick}
        />
      );
      const button = screen.getByRole('button');

      await user.click(button);

      await waitFor(() => {
        expect(errorOnClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible via Enter key when enabled', async () => {
      const user = userEvent.setup();
      render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should be accessible via Space key when enabled', async () => {
      const user = userEvent.setup();
      render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should have appropriate aria-label for different modes', () => {
      const { rerender } = render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByLabelText('Add project')).toBeInTheDocument();

      rerender(
        <SubmitProjectButton
          mode="update"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByLabelText('Save project')).toBeInTheDocument();
    });
  });

  describe('mode transitions', () => {
    it('should update text and label when mode changes from create to edit', () => {
      const { rerender } = render(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Add');
      expect(screen.getByLabelText('Add project')).toBeInTheDocument();

      rerender(
        <SubmitProjectButton
          mode="update"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Save');
      expect(screen.getByLabelText('Save project')).toBeInTheDocument();
    });

    it('should update text and label when mode changes from edit to create', () => {
      const { rerender } = render(
        <SubmitProjectButton
          mode="update"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Save');
      expect(screen.getByLabelText('Save project')).toBeInTheDocument();

      rerender(
        <SubmitProjectButton
          mode="create"
          disabled={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Add');
      expect(screen.getByLabelText('Add project')).toBeInTheDocument();
    });
  });
});
