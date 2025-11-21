import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectNameInput } from './ProjectNameInput';
import { useState } from 'react';

vi.mock('@/shared/constants', () => ({
  MAX_NAME_LENGTH: 50,
}));

vi.mock('@/shared/components/ui/input', () => ({
  Input: ({ onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      onChange={onChange}
      {...props}
    />
  ),
}));

vi.mock('@/shared/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock('@/shared/components/atoms/InputValueCount/InputValueCount', () => ({
  InputValueCount: ({ valueLength, maxLength }: { valueLength: number; maxLength: number }) => (
    <div data-testid="input-value-count">
      {valueLength}/{maxLength}
    </div>
  ),
}));

describe('ProjectNameInput', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    disabled: false,
  };

  function renderControlledInput() {
    const Wrapper = () => {
      const [value, setValue] = useState('');
      return (
        <ProjectNameInput
          {...defaultProps}
          value={value}
          onChange={(val) => {
            mockOnChange(val);
            setValue(val);
          }}
        />
      );
    };

    render(<Wrapper />);
    return mockOnChange;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render label with correct text', () => {
      render(<ProjectNameInput {...defaultProps} />);

      expect(screen.getByLabelText('Project name')).toBeInTheDocument();
    });

    it('should render input with correct placeholder', () => {
      render(<ProjectNameInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter project name (e.g. Performance Tracker)');
      expect(input).toBeInTheDocument();
    });

    it('should render input with correct id', () => {
      render(<ProjectNameInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'project_name');
    });

    it('should display current value in input', () => {
      const testValue = 'My Project';

      render(
        <ProjectNameInput
          {...defaultProps}
          value={testValue}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(testValue);
    });

    it('should render InputValueCount component', () => {
      render(
        <ProjectNameInput
          {...defaultProps}
          value="Test"
        />
      );

      expect(screen.getByTestId('input-value-count')).toBeInTheDocument();
      expect(screen.getByText('4/50')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChange when user types in input', async () => {
      const user = userEvent.setup();
      const onChange = renderControlledInput();
      const input = screen.getByRole('textbox');

      await user.type(input, 'New Project');

      expect(onChange).toHaveBeenCalledTimes(11);
      expect(onChange).toHaveBeenLastCalledWith('New Project');
    });

    it('should call onChange with single character', async () => {
      const user = userEvent.setup();
      render(<ProjectNameInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'A');

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('A');
    });

    it('should call onChange when clearing input', async () => {
      const user = userEvent.setup();
      render(
        <ProjectNameInput
          {...defaultProps}
          value="Test"
        />
      );

      const input = screen.getByRole('textbox');
      await user.clear(input);

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should call onChange for each keystroke', async () => {
      const user = userEvent.setup();
      const onChange = renderControlledInput();
      const input = screen.getByRole('textbox');

      await user.type(input, 'ABC');

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, 'A');
      expect(onChange).toHaveBeenNthCalledWith(2, 'AB');
      expect(onChange).toHaveBeenNthCalledWith(3, 'ABC');
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      render(
        <ProjectNameInput
          {...defaultProps}
          disabled={true}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should enable input when disabled prop is false', () => {
      render(
        <ProjectNameInput
          {...defaultProps}
          disabled={false}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).not.toBeDisabled();
    });

    it('should not call onChange when typing in disabled input', async () => {
      const user = userEvent.setup();
      render(
        <ProjectNameInput
          {...defaultProps}
          disabled={true}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should set maxLength attribute to MAX_NAME_LENGTH', () => {
      render(<ProjectNameInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '50');
    });

    it('should set aria-invalid to false when value is within limit', () => {
      const validValue = 'A'.repeat(50);

      render(
        <ProjectNameInput
          {...defaultProps}
          value={validValue}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should set aria-invalid to true when value exceeds limit', () => {
      const invalidValue = 'A'.repeat(51);

      render(
        <ProjectNameInput
          {...defaultProps}
          value={invalidValue}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should update InputValueCount with current value length', () => {
      const value = 'Project Name';

      render(
        <ProjectNameInput
          {...defaultProps}
          value={value}
        />
      );

      expect(screen.getByText('12/50')).toBeInTheDocument();
    });

    it('should update InputValueCount when value changes', () => {
      const { rerender } = render(
        <ProjectNameInput
          {...defaultProps}
          value="Test"
        />
      );
      expect(screen.getByText('4/50')).toBeInTheDocument();

      rerender(
        <ProjectNameInput
          {...defaultProps}
          value="Test Project"
        />
      );

      expect(screen.getByText('12/50')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-describedby pointing to character count', () => {
      render(<ProjectNameInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'project-name-count');
    });

    it('should associate label with input using htmlFor', () => {
      render(<ProjectNameInput {...defaultProps} />);

      const label = screen.getByText('Project name');
      expect(label).toHaveAttribute('for', 'project_name');
    });

    it('should be accessible via label click', async () => {
      const user = userEvent.setup();
      render(<ProjectNameInput {...defaultProps} />);

      const label = screen.getByText('Project name');
      await user.click(label);

      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string value', () => {
      render(
        <ProjectNameInput
          {...defaultProps}
          value=""
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
      expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('should handle special characters in value', async () => {
      const user = userEvent.setup();
      const onChange = renderControlledInput();
      const input = screen.getByRole('textbox');

      await user.type(input, '!@#$%');

      expect(onChange).toHaveBeenLastCalledWith('!@#$%');
    });

    it('should handle numeric characters in value', async () => {
      const user = userEvent.setup();
      const onChange = renderControlledInput();
      const input = screen.getByRole('textbox');

      await user.type(input, '12345');

      expect(onChange).toHaveBeenLastCalledWith('12345');
    });

    it('should handle spaces in value', async () => {
      const user = userEvent.setup();
      const onChange = renderControlledInput();
      const input = screen.getByRole('textbox');

      await user.type(input, 'My Project');

      expect(onChange).toHaveBeenLastCalledWith('My Project');
    });

    it('should handle value at exactly max length', () => {
      const maxLengthValue = 'A'.repeat(50);

      render(
        <ProjectNameInput
          {...defaultProps}
          value={maxLengthValue}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(maxLengthValue);
      expect(screen.getByText('50/50')).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
