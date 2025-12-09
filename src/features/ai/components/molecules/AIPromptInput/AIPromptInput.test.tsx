import { AIPromptInput } from '@/features/ai/components/molecules/AIPromptInput/AIPromptInput';
import { MAX_PROMPT_LENGTH } from '@/shared/constants';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/constants', () => ({
  MAX_PROMPT_LENGTH: 500,
}));

vi.mock('@/shared/components/atoms/InputValueCount/InputValueCount', () => ({
  InputValueCount: ({ valueLength, maxLength }: { valueLength: number; maxLength: number }) => (
    <div data-testid="input-value-count">
      {valueLength}/{maxLength}
    </div>
  ),
}));

describe('AIPromptInput', () => {
  const PLACEHOLDER_TEXT = 'Tell me about your project. What do you want to accomplish?';
  const LABEL_TEXT = 'AI task prompt';
  const mockOnChange = vi.fn();

  const renderComponent = (value = '') => {
    return render(
      <AIPromptInput
        value={value}
        onChange={mockOnChange}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render textarea with placeholder and correct attributes', () => {
      renderComponent();

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'ai_prompt');
      expect(textarea).toHaveAttribute('placeholder', PLACEHOLDER_TEXT);
      expect(textarea).toHaveAttribute('aria-describedby', 'ai-task-generator-description');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('should render visually hidden label linked to textarea', () => {
      renderComponent();

      const label = screen.getByText(LABEL_TEXT);
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('sr-only');
      expect(document.querySelector('label[for="ai_prompt"]')).toBeInTheDocument();
    });

    it('should render character counter with correct count', () => {
      renderComponent('Hello');

      expect(screen.getByTestId('input-value-count')).toBeInTheDocument();
      expect(screen.getByText('5/500')).toBeInTheDocument();
    });

    it('should autofocus textarea on mount', () => {
      renderComponent();

      expect(document.activeElement).toBe(screen.getByRole('textbox'));
    });
  });

  describe('user input', () => {
    it('should display current value', () => {
      renderComponent('Test prompt');

      expect(screen.getByDisplayValue('Test prompt')).toBeInTheDocument();
    });

    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      renderComponent();
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'A');

      expect(mockOnChange).toHaveBeenCalledWith('A');
    });

    it('should update displayed value when prop changes', () => {
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

    it('should handle multiline and special character input', async () => {
      const user = userEvent.setup();
      renderComponent();
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Line 1{Enter}@#$%');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('character counter', () => {
    it('should show correct count for empty and non-empty input', () => {
      const { rerender } = renderComponent();

      expect(screen.getByText('0/500')).toBeInTheDocument();

      rerender(
        <AIPromptInput
          value="Hello world"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('11/500')).toBeInTheDocument();
    });

    it('should show count at maximum length', () => {
      const maxText = 'a'.repeat(MAX_PROMPT_LENGTH);

      renderComponent(maxText);

      expect(screen.getByText(`${MAX_PROMPT_LENGTH}/${MAX_PROMPT_LENGTH}`)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('should handle text exceeding maximum length', () => {
      const longText = 'a'.repeat(1000);

      renderComponent(longText);

      expect(screen.getByRole('textbox')).toHaveValue(longText);
    });
  });
});
