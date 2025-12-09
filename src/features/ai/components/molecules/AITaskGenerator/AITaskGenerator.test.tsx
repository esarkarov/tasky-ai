import {
  AITaskGenerator,
  AITaskGeneratorProps,
} from '@/features/ai/components/molecules/AITaskGenerator/AITaskGenerator';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react', () => ({
  Bot: (props: Record<string, unknown>) => (
    <svg
      data-testid="bot-icon"
      {...props}
    />
  ),
}));

vi.mock('@/features/ai/components/molecules/AIPromptInput/AIPromptInput', () => ({
  AIPromptInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="ai-prompt-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="AI Prompt"
    />
  ),
}));

vi.mock('@/shared/components/ui/switch', () => ({
  Switch: ({
    checked,
    onCheckedChange,
    disabled,
    ...props
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      id="ai_generate"
      {...props}>
      {checked ? 'On' : 'Off'}
    </button>
  ),
}));

describe('AITaskGenerator', () => {
  const mockOnCheckedChange = vi.fn();
  const mockOnValueChange = vi.fn();

  const renderComponent = (props?: Partial<AITaskGeneratorProps>) => {
    const defaultProps = {
      checked: false,
      value: '',
      disabled: false,
      onCheckedChange: mockOnCheckedChange,
      onValueChange: mockOnValueChange,
    };
    return render(
      <AITaskGenerator
        {...defaultProps}
        {...props}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render title, description, icon, and switch with correct accessibility attributes', () => {
      renderComponent();

      expect(screen.getByText('AI Task Generator')).toBeInTheDocument();
      expect(screen.getByText('Automatically create tasks by providing a simple prompt.')).toBeInTheDocument();

      const icon = screen.getByTestId('bot-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'ai-task-generator-label');

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should link label and switch with matching ids', () => {
      renderComponent();

      const label = screen.getByText('AI Task Generator');
      expect(label).toHaveAttribute('for', 'ai_generate');
      expect(screen.getByRole('switch')).toHaveAttribute('id', 'ai_generate');
    });

    it('should associate switch with description text', () => {
      renderComponent();

      const description = screen.getByText('Automatically create tasks by providing a simple prompt.');
      expect(description).toHaveAttribute('id', 'ai-task-generator-description');
      expect(screen.getByRole('switch')).toHaveAttribute('aria-describedby', 'ai-task-generator-description');
    });
  });

  describe('switch behavior', () => {
    it('should render switch as checked when prop is true', () => {
      renderComponent({ checked: true });

      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('should call onCheckedChange with correct value when toggled', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('switch'));

      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);

      render(
        <AITaskGenerator
          checked={true}
          value=""
          disabled={false}
          onCheckedChange={mockOnCheckedChange}
          onValueChange={mockOnValueChange}
        />
      );

      await user.click(screen.getByRole('switch'));

      expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
    });

    it('should not call onCheckedChange when switch is disabled', async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      await user.click(screen.getByRole('switch'));

      expect(mockOnCheckedChange).not.toHaveBeenCalled();
      expect(screen.getByRole('switch')).toBeDisabled();
    });
  });

  describe('prompt input', () => {
    it('should not render AIPromptInput when switch is unchecked', () => {
      renderComponent();

      expect(screen.queryByTestId('ai-prompt-input')).not.toBeInTheDocument();
    });

    it('should render AIPromptInput with correct value when switch is checked', () => {
      renderComponent({ checked: true, value: 'Prompt text' });

      const input = screen.getByTestId('ai-prompt-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Prompt text');
    });

    it('should call onValueChange when input text changes', async () => {
      const user = userEvent.setup();
      renderComponent({ checked: true });

      await user.type(screen.getByTestId('ai-prompt-input'), 'New prompt');

      expect(mockOnValueChange).toHaveBeenCalled();
    });

    it('should hide AIPromptInput when switch is toggled off', () => {
      const { rerender } = renderComponent({ checked: true, value: 'Prompt' });
      expect(screen.getByTestId('ai-prompt-input')).toBeInTheDocument();

      rerender(
        <AITaskGenerator
          checked={false}
          value="Prompt"
          disabled={false}
          onCheckedChange={mockOnCheckedChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.queryByTestId('ai-prompt-input')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle long input values without crashing', () => {
      const longText = 'x'.repeat(1000);

      renderComponent({ checked: true, value: longText });

      expect(screen.getByTestId('ai-prompt-input')).toHaveValue(longText);
    });
  });
});
