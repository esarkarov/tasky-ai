import { MAX_PROMPT_LENGTH } from '@/shared/constants/validation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIPromptInput } from './AIPromptInput';

vi.mock('@/shared/constants/validation', () => ({
  MAX_PROMPT_LENGTH: 500,
}));

vi.mock('@/shared/components/atoms/InputValueCount/InputValueCount', () => ({
  InputValueCount: ({ valueLength, maxLength }: { valueLength: number; maxLength: number }) => (
    <div data-testid="input-value-count">
      {valueLength}/{maxLength}
    </div>
  ),
}));

const placeholderText = 'Tell me about your project. What do you want to accomplish?';
const labelText = 'AI task prompt';
const mockOnChange = vi.fn();

describe('AIPromptInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (value = '') => {
    return render(
      <AIPromptInput
        value={value}
        onChange={mockOnChange}
      />
    );
  };

  describe('basic rendering', () => {
    it('renders the textarea with placeholder', () => {
      renderComponent();

      expect(screen.getByPlaceholderText(placeholderText)).toBeInTheDocument();
    });

    it('renders the visually hidden label linked to textarea', () => {
      renderComponent();
      const label = screen.getByText(labelText);

      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('sr-only');
      expect(document.querySelector('label[for="ai_prompt"]')).toBeInTheDocument();
    });

    it('includes the InputValueCount component', () => {
      renderComponent('test');
      expect(screen.getByTestId('input-value-count')).toBeInTheDocument();
    });

    it('sets the correct textarea id', () => {
      renderComponent();
      expect(screen.getByPlaceholderText(placeholderText)).toHaveAttribute('id', 'ai_prompt');
    });
  });

  describe('controlled input behavior', () => {
    it('displays current value', () => {
      renderComponent('Test prompt');
      expect(screen.getByDisplayValue('Test prompt')).toBeInTheDocument();
    });

    it('calls onChange when user types', async () => {
      const user = userEvent.setup();
      renderComponent();
      const textarea = screen.getByPlaceholderText(placeholderText);

      await user.type(textarea, 'New text');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('calls onChange with the typed value', async () => {
      const user = userEvent.setup();
      renderComponent();
      const textarea = screen.getByPlaceholderText(placeholderText);

      await user.type(textarea, 'A');

      expect(mockOnChange).toHaveBeenCalledWith('A');
    });

    it('updates displayed value when prop changes', () => {
      const { rerender } = renderComponent('Initial');
      expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();

      rerender(
        <AIPromptInput
          value="Updated"
          onChange={mockOnChange}
        />
      );
      expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
    });
  });

  describe('character counter', () => {
    it('shows correct character count for empty input', () => {
      renderComponent();
      expect(screen.getByText('0/500')).toBeInTheDocument();
    });

    it('shows correct character count for non-empty input', () => {
      renderComponent('Hello world');
      expect(screen.getByText('11/500')).toBeInTheDocument();
    });

    it('updates character count as user types', async () => {
      const user = userEvent.setup();
      const { rerender } = renderComponent();
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test');

      rerender(
        <AIPromptInput
          value="Test"
          onChange={mockOnChange}
        />
      );
      expect(screen.getByText('4/500')).toBeInTheDocument();
    });

    it('shows character count at maximum length', () => {
      const maxText = 'a'.repeat(MAX_PROMPT_LENGTH);
      renderComponent(maxText);

      expect(screen.getByText(`${MAX_PROMPT_LENGTH}/${MAX_PROMPT_LENGTH}`)).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('sets aria-invalid to false for valid input', () => {
      renderComponent('Valid');

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-invalid to false at max length', () => {
      const maxText = 'a'.repeat(MAX_PROMPT_LENGTH);
      renderComponent(maxText);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('accessibility', () => {
    it('has aria-describedby linking to helper text', () => {
      renderComponent();

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'ai-task-generator-description');
    });

    it('autofocuses on mount', () => {
      renderComponent();

      expect(document.activeElement).toBe(screen.getByRole('textbox'));
    });
  });

  describe('edge cases', () => {
    it('handles multiline input', async () => {
      const user = userEvent.setup();
      renderComponent();
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Line 1{Enter}Line 2');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles special characters', async () => {
      const user = userEvent.setup();
      renderComponent();
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, '@#$%');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('displays empty value', () => {
      renderComponent();

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('renders very long input text', () => {
      const longText = 'a'.repeat(1000);
      renderComponent(longText);

      expect(screen.getByRole('textbox')).toHaveValue(longText);
    });
  });
});
