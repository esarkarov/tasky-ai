import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskFormActions } from './TaskFormActions';
import { CrudMode } from '@/types/shared.types';

vi.mock('@/components/atoms/CancelTaskButton/CancelTaskButton', () => ({
  CancelTaskButton: ({ onClick }: { onClick: () => void }) => (
    <button
      data-testid="cancel-button"
      onClick={onClick}>
      Cancel
    </button>
  ),
}));

vi.mock('@/components/atoms/SubmitTaskButton/SubmitTaskButton', () => ({
  SubmitTaskButton: ({
    mode,
    disabled,
    onClick,
  }: {
    mode: CrudMode;
    disabled: boolean;
    onClick: () => Promise<void>;
  }) => (
    <button
      data-testid="submit-button"
      data-mode={mode}
      disabled={disabled}
      onClick={onClick}>
      {mode === 'create' ? 'Add Task' : 'Update Task'}
    </button>
  ),
}));

describe('TaskFormActions', () => {
  const mockHandleCancel = vi.fn();
  const mockHandleSubmit = vi.fn();

  const defaultProps = {
    mode: 'create' as CrudMode,
    disabled: false,
    handleCancel: mockHandleCancel,
    handleSubmit: mockHandleSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render cancel button', () => {
      render(<TaskFormActions {...defaultProps} />);

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<TaskFormActions {...defaultProps} />);

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should have role group on container', () => {
      render(<TaskFormActions {...defaultProps} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('should have aria-label on container', () => {
      render(<TaskFormActions {...defaultProps} />);

      expect(screen.getByLabelText('Task form actions')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call handleCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskFormActions {...defaultProps} />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockHandleCancel).toHaveBeenCalledTimes(1);
    });

    it('should call handleSubmit when submit button is clicked', async () => {
      const user = userEvent.setup();
      mockHandleSubmit.mockResolvedValue(undefined);
      render(<TaskFormActions {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mode prop', () => {
    it('should pass create mode to submit button', () => {
      render(
        <TaskFormActions
          {...defaultProps}
          mode="create"
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveAttribute('data-mode', 'create');
      expect(submitButton).toHaveTextContent('Add Task');
    });

    it('should pass update mode to submit button', () => {
      render(
        <TaskFormActions
          {...defaultProps}
          mode="update"
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveAttribute('data-mode', 'update');
      expect(submitButton).toHaveTextContent('Update Task');
    });
  });

  describe('disabled state', () => {
    it('should pass disabled prop to submit button', () => {
      render(
        <TaskFormActions
          {...defaultProps}
          disabled={true}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when disabled is false', () => {
      render(
        <TaskFormActions
          {...defaultProps}
          disabled={false}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });
  });
});
