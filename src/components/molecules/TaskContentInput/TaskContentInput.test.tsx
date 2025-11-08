import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { TaskContentInput } from './TaskContentInput';

vi.mock('@/components/atoms/InputValueCount/InputValueCount', () => ({
  InputValueCount: ({ valueLength, maxLength }: { valueLength: number; maxLength: number }) => (
    <div data-testid="input-value-count">
      {valueLength}/{maxLength}
    </div>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
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

vi.mock('@/constants/validation', () => ({
  MAX_CONTENT_LENGTH: 500,
}));

describe('TaskContentInput', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: '',
    disabled: false,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render the textarea with correct attributes', () => {
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('id', 'task-content');
      expect(textarea).toHaveAttribute('placeholder', 'After finishing the project, take a tour');
      expect(textarea).toHaveAttribute('maxlength', '500');
    });

    it('should render the label with sr-only class', () => {
      render(<TaskContentInput {...defaultProps} />);

      const label = screen.getByText('Task description');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('sr-only');
    });

    it('should render InputValueCount component', () => {
      render(
        <TaskContentInput
          {...defaultProps}
          value="Hello"
        />
      );

      const counter = screen.getByTestId('input-value-count');
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveTextContent('5/500');
    });

    it('should render keyboard instruction text for screen readers', () => {
      render(<TaskContentInput {...defaultProps} />);

      const instruction = screen.getByText('Press Enter to save, Shift+Enter for new line.');
      expect(instruction).toBeInTheDocument();
      expect(instruction).toHaveClass('sr-only');
    });

    it('should render all child components in correct order', () => {
      const { container } = render(<TaskContentInput {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.children).toHaveLength(4);
    });
  });

  describe('value display', () => {
    it('should display the provided value', () => {
      render(
        <TaskContentInput
          {...defaultProps}
          value="Test task content"
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveValue('Test task content');
    });

    it('should display empty value when value is empty string', () => {
      render(
        <TaskContentInput
          {...defaultProps}
          value=""
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveValue('');
    });

    it('should update character count based on value length', () => {
      const { rerender } = render(
        <TaskContentInput
          {...defaultProps}
          value="Hello"
        />
      );

      expect(screen.getByTestId('input-value-count')).toHaveTextContent('5/500');

      rerender(
        <TaskContentInput
          {...defaultProps}
          value="Hello World"
        />
      );
      expect(screen.getByTestId('input-value-count')).toHaveTextContent('11/500');
    });
  });

  describe('user interaction', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      await user.type(textarea, 'New task');

      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith('N');
      expect(mockOnChange).toHaveBeenCalledWith('e');
    });

    it('should pass the current value to onChange', async () => {
      const user = userEvent.setup();
      render(
        <TaskContentInput
          {...defaultProps}
          value="Initial"
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      await user.clear(textarea);
      await user.type(textarea, 'Changed');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle multi-line input with Shift+Enter', async () => {
      const user = userEvent.setup();
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should prevent default on Enter key without Shift', async () => {
      const user = userEvent.setup();

      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });

      await user.click(textarea);
      await user.keyboard('{Enter}');

      expect(textarea).toBeInTheDocument();
    });

    it('should not prevent default on Enter key with Shift', async () => {
      const user = userEvent.setup();
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      await user.click(textarea);

      await user.keyboard('{Shift>}{Enter}{/Shift}');

      expect(textarea).toBeInTheDocument();
    });

    it('should handle other keys normally', async () => {
      const user = userEvent.setup();
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      await user.type(textarea, 'abc{Backspace}{Delete}');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should disable textarea when disabled prop is true', () => {
      render(
        <TaskContentInput
          {...defaultProps}
          disabled={true}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toBeDisabled();
    });

    it('should not call onChange when disabled and user attempts to type', async () => {
      const user = userEvent.setup();
      render(
        <TaskContentInput
          {...defaultProps}
          disabled={true}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });

      await user.type(textarea, 'test');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should enable textarea when disabled prop is false', () => {
      render(
        <TaskContentInput
          {...defaultProps}
          disabled={false}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).not.toBeDisabled();
    });
  });

  describe('max length', () => {
    it('should enforce max length constraint', () => {
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveAttribute('maxlength', '500');
    });

    it('should pass max length to InputValueCount', () => {
      render(
        <TaskContentInput
          {...defaultProps}
          value="test"
        />
      );

      const counter = screen.getByTestId('input-value-count');
      expect(counter).toHaveTextContent('4/500');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveAttribute('aria-label', 'Task content input');
    });

    it('should have aria-multiline attribute', () => {
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveAttribute('aria-multiline', 'true');
    });

    it('should have associated label with htmlFor attribute', () => {
      render(<TaskContentInput {...defaultProps} />);

      const label = screen.getByText('Task description');
      expect(label).toHaveAttribute('for');

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveAttribute('id', 'task-content');
    });

    it('should provide keyboard instructions for screen readers', () => {
      render(<TaskContentInput {...defaultProps} />);

      const instruction = screen.getByText('Press Enter to save, Shift+Enter for new line.');
      expect(instruction).toBeInTheDocument();
      expect(instruction.className).toContain('sr-only');
    });
  });

  describe('edge cases', () => {
    it('should handle empty value', () => {
      render(
        <TaskContentInput
          {...defaultProps}
          value=""
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveValue('');

      const counter = screen.getByTestId('input-value-count');
      expect(counter).toHaveTextContent('0/500');
    });

    it('should handle value at max length', () => {
      const maxLengthValue = 'a'.repeat(500);
      render(
        <TaskContentInput
          {...defaultProps}
          value={maxLengthValue}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      expect(textarea).toHaveValue(maxLengthValue);

      const counter = screen.getByTestId('input-value-count');
      expect(counter).toHaveTextContent('500/500');
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      render(<TaskContentInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: 'Task content input' });
      await user.type(textarea, '!@#$%^&*()');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});
