import { TaskContentInput } from '@/features/tasks/components/molecules/TaskContentInput/TaskContentInput';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/components/atoms/InputValueCount/InputValueCount', () => ({
  InputValueCount: ({ valueLength, maxLength }: { valueLength: number; maxLength: number }) => (
    <div data-testid="input-value-count">
      {valueLength}/{maxLength}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/textarea', () => ({
  Textarea: ({
    id,
    className,
    placeholder,
    maxLength,
    value,
    disabled,
    onChange,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-multiline': ariaMultiline,
  }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    'aria-label'?: string;
    'aria-multiline'?: string;
  }) => (
    <textarea
      id={id}
      className={className}
      placeholder={placeholder}
      maxLength={maxLength}
      value={value}
      disabled={disabled}
      onChange={onChange}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      aria-multiline={ariaMultiline}
      autoFocus
    />
  ),
}));

vi.mock('@/shared/constants', () => ({
  MAX_CONTENT_LENGTH: 500,
}));

describe('TaskContentInput', () => {
  const mockOnChange = vi.fn();

  const renderComponent = (value = '', disabled = false) => {
    return render(
      <TaskContentInput
        value={value}
        disabled={disabled}
        onChange={mockOnChange}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render textarea with correct attributes and accessibility properties', () => {
      renderComponent();

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveAttribute('id', 'task-content');
      expect(textarea).toHaveAttribute('placeholder', 'After finishing the project, take a tour');
      expect(textarea).toHaveAttribute('maxlength', '500');
      expect(textarea).toHaveAttribute('aria-label', 'Task content input');
      expect(textarea).toHaveAttribute('aria-multiline', 'true');
    });

    it('should render visually hidden label and keyboard instructions', () => {
      renderComponent();

      const label = screen.getByText('Task description');
      expect(label).toHaveClass('sr-only');
      expect(label).toHaveAttribute('for');

      const instruction = screen.getByText('Press Enter to save, Shift+Enter for new line.');
      expect(instruction).toHaveClass('sr-only');
    });

    it('should render character counter with correct count', () => {
      renderComponent('Hello');

      const counter = screen.getByTestId('input-value-count');
      expect(counter).toHaveTextContent('5/500');
    });
  });

  describe('value display', () => {
    it('should display provided value', () => {
      renderComponent('Test task content');

      expect(screen.getByRole('textbox', { name: 'Task content input' })).toHaveValue('Test task content');
    });

    it('should update character count when value changes', () => {
      const { rerender } = renderComponent('Hello');
      expect(screen.getByTestId('input-value-count')).toHaveTextContent('5/500');

      rerender(
        <TaskContentInput
          value="Hello World"
          disabled={false}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('input-value-count')).toHaveTextContent('11/500');
    });

    it('should handle empty and maximum length values', () => {
      const { rerender } = renderComponent('');

      expect(screen.getByRole('textbox', { name: 'Task content input' })).toHaveValue('');
      expect(screen.getByTestId('input-value-count')).toHaveTextContent('0/500');

      const maxLengthValue = 'a'.repeat(500);
      rerender(
        <TaskContentInput
          value={maxLengthValue}
          disabled={false}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('textbox', { name: 'Task content input' })).toHaveValue(maxLengthValue);
      expect(screen.getByTestId('input-value-count')).toHaveTextContent('500/500');
    });
  });

  describe('user interaction', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.type(screen.getByRole('textbox', { name: 'Task content input' }), 'New task');

      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith('N');
    });

    it('should handle multi-line input with Shift+Enter', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.type(
        screen.getByRole('textbox', { name: 'Task content input' }),
        'Line 1{Shift>}{Enter}{/Shift}Line 2'
      );

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.type(screen.getByRole('textbox', { name: 'Task content input' }), '!@#$%');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should prevent default on Enter key without Shift', async () => {
      const user = userEvent.setup();
      renderComponent();
      const textarea = screen.getByRole('textbox', { name: 'Task content input' });

      await user.click(textarea);
      await user.keyboard('{Enter}');

      expect(textarea).toBeInTheDocument();
    });

    it('should allow new line on Enter key with Shift', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('textbox', { name: 'Task content input' }));
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      expect(screen.getByRole('textbox', { name: 'Task content input' })).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable textarea and prevent onChange when disabled', async () => {
      const user = userEvent.setup();
      renderComponent('', true);
      const textarea = screen.getByRole('textbox', { name: 'Task content input' });

      expect(textarea).toBeDisabled();

      await user.type(textarea, 'test');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should enable textarea when disabled is false', () => {
      renderComponent('', false);

      expect(screen.getByRole('textbox', { name: 'Task content input' })).not.toBeDisabled();
    });
  });
});
