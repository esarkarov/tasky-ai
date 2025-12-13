import { TaskFormActions } from '@/features/tasks/components/molecules/TaskFormActions/TaskFormActions';
import { CrudMode } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tasks/components/atoms/CancelTaskButton/CancelTaskButton', () => ({
  CancelTaskButton: ({ onClick }: { onClick: () => void }) => (
    <button
      data-testid="cancel-button"
      onClick={onClick}>
      Cancel
    </button>
  ),
}));

vi.mock('@/features/tasks/components/atoms/SubmitTaskButton/SubmitTaskButton', () => ({
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

  const renderComponent = (mode: CrudMode = 'create', disabled = false) => {
    return render(
      <TaskFormActions
        mode={mode}
        disabled={disabled}
        handleCancel={mockHandleCancel}
        handleSubmit={mockHandleSubmit}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render cancel and submit buttons with correct accessibility attributes', () => {
    renderComponent();

    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByLabelText('Task form actions')).toBeInTheDocument();
  });

  it('should call handleCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByTestId('cancel-button'));

    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
  });

  it('should call handleSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    mockHandleSubmit.mockResolvedValue(undefined);
    renderComponent();

    await user.click(screen.getByTestId('submit-button'));

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should render submit button with create mode text and attribute', () => {
    renderComponent('create');

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveAttribute('data-mode', 'create');
    expect(submitButton).toHaveTextContent('Add Task');
  });

  it('should render submit button with update mode text and attribute', () => {
    renderComponent('update');

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveAttribute('data-mode', 'update');
    expect(submitButton).toHaveTextContent('Update Task');
  });

  it('should disable submit button when disabled prop is true', () => {
    renderComponent('create', true);

    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('should enable submit button when disabled prop is false', () => {
    renderComponent('create', false);

    expect(screen.getByTestId('submit-button')).not.toBeDisabled();
  });
});
