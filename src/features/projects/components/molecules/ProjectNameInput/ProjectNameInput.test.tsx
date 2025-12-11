import { ProjectNameInput } from '@/features/projects/components/molecules/ProjectNameInput/ProjectNameInput';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/constants', () => ({
  MAX_NAME_LENGTH: 50,
}));

vi.mock('@/shared/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

interface LabelProps {
  children: React.ReactNode;
  htmlFor: string;
}

vi.mock('@/shared/components/ui/label', () => ({
  Label: ({ children, htmlFor }: LabelProps) => <label htmlFor={htmlFor}>{children}</label>,
}));

interface InputValueCountProps {
  valueLength: number;
  maxLength: number;
}

vi.mock('@/shared/components/atoms/InputValueCount/InputValueCount', () => ({
  InputValueCount: ({ valueLength, maxLength }: InputValueCountProps) => (
    <div
      data-testid="input-value-count"
      id="project-name-count">
      {valueLength}/{maxLength}
    </div>
  ),
}));

describe('ProjectNameInput', () => {
  const mockOnChange = vi.fn();

  interface RenderOptions {
    value?: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
  }

  const renderComponent = ({ value = '', disabled = false, onChange = mockOnChange }: RenderOptions = {}) => {
    render(
      <ProjectNameInput
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  };

  const renderControlledInput = () => {
    const ControlledWrapper = () => {
      const [value, setValue] = useState('');
      return (
        <ProjectNameInput
          value={value}
          disabled={false}
          onChange={(val) => {
            mockOnChange(val);
            setValue(val);
          }}
        />
      );
    };

    render(<ControlledWrapper />);
  };

  const getInput = () => screen.getByRole('textbox');
  const getLabel = () => screen.getByText('Project name');
  const getCharacterCount = () => screen.getByTestId('input-value-count');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render input with label, placeholder, and character count', () => {
      renderComponent();

      expect(getLabel()).toBeInTheDocument();
      expect(getLabel()).toHaveAttribute('for', 'project_name');
      expect(getInput()).toHaveAttribute('id', 'project_name');
      expect(getInput()).toHaveAttribute('placeholder', 'Enter project name (e.g. Performance Tracker)');
      expect(getCharacterCount()).toBeInTheDocument();
    });

    it('should display current value in input', () => {
      renderComponent({ value: 'My Project' });

      expect(getInput()).toHaveValue('My Project');
      expect(screen.getByText('10/50')).toBeInTheDocument();
    });

    it('should render with empty value by default', () => {
      renderComponent({ value: '' });

      expect(getInput()).toHaveValue('');
      expect(screen.getByText('0/50')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChange when user types text', async () => {
      const user = userEvent.setup();
      renderControlledInput();

      await user.type(getInput(), 'New Project');

      expect(mockOnChange).toHaveBeenCalledTimes(11);
      expect(mockOnChange).toHaveBeenLastCalledWith('New Project');
    });

    it('should call onChange for each character typed', async () => {
      const user = userEvent.setup();
      renderControlledInput();

      await user.type(getInput(), 'ABC');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 'A');
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'AB');
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'ABC');
    });

    it('should call onChange when input is cleared', async () => {
      const user = userEvent.setup();
      renderComponent({ value: 'Test' });

      await user.clear(getInput());

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      renderControlledInput();

      await user.type(getInput(), '!@#$%');

      expect(mockOnChange).toHaveBeenLastCalledWith('!@#$%');
    });

    it('should handle numeric characters', async () => {
      const user = userEvent.setup();
      renderControlledInput();

      await user.type(getInput(), '12345');

      expect(mockOnChange).toHaveBeenLastCalledWith('12345');
    });

    it('should handle spaces in value', async () => {
      const user = userEvent.setup();
      renderControlledInput();

      await user.type(getInput(), 'My Project');

      expect(mockOnChange).toHaveBeenLastCalledWith('My Project');
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      renderComponent({ disabled: true });

      expect(getInput()).toBeDisabled();
    });

    it('should enable input when disabled prop is false', () => {
      renderComponent({ disabled: false });

      expect(getInput()).not.toBeDisabled();
    });

    it('should not call onChange when typing in disabled input', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      await user.type(getInput(), 'Test');

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should set maxLength attribute to 50', () => {
      renderComponent();

      expect(getInput()).toHaveAttribute('maxLength', '50');
    });

    it('should set aria-invalid to false when value is within limit', () => {
      renderComponent({ value: 'A'.repeat(50) });

      expect(getInput()).toHaveAttribute('aria-invalid', 'false');
    });

    it('should set aria-invalid to true when value exceeds limit', () => {
      renderComponent({ value: 'A'.repeat(51) });

      expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    });

    it('should display correct character count as value changes', () => {
      const { rerender } = render(
        <ProjectNameInput
          value="Test"
          onChange={mockOnChange}
          disabled={false}
        />
      );

      expect(screen.getByText('4/50')).toBeInTheDocument();

      rerender(
        <ProjectNameInput
          value="Test Project"
          onChange={mockOnChange}
          disabled={false}
        />
      );

      expect(screen.getByText('12/50')).toBeInTheDocument();
    });

    it('should handle value at exactly max length', () => {
      const maxLengthValue = 'A'.repeat(50);
      renderComponent({ value: maxLengthValue });

      expect(getInput()).toHaveValue(maxLengthValue);
      expect(screen.getByText('50/50')).toBeInTheDocument();
      expect(getInput()).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('accessibility', () => {
    it('should associate input with label using id', () => {
      renderComponent();

      expect(getLabel()).toHaveAttribute('for', 'project_name');
      expect(getInput()).toHaveAttribute('id', 'project_name');
      expect(screen.getByLabelText('Project name')).toBe(getInput());
    });

    it('should have aria-describedby pointing to character count', () => {
      renderComponent();

      expect(getInput()).toHaveAttribute('aria-describedby', 'project-name-count');
    });

    it('should focus input when label is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getLabel());

      expect(getInput()).toHaveFocus();
    });
  });
});
