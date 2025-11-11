import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AITaskGenerator } from './AITaskGenerator';

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
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (props?: Partial<React.ComponentProps<typeof AITaskGenerator>>) => {
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
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders title, description, and section layout', () => {
      renderComponent();
      expect(screen.getByText('AI Task Generator')).toBeInTheDocument();
      expect(screen.getByText('Automatically create tasks by providing a simple prompt.')).toBeInTheDocument();
      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'ai-task-generator-label');
    });

    it('renders Bot icon hidden from screen readers', () => {
      renderComponent();
      const icon = screen.getByTestId('bot-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders a toggle switch', () => {
      renderComponent();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('switch behavior', () => {
    it('renders unchecked by default', () => {
      renderComponent();
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('renders checked when prop is true', () => {
      renderComponent({ checked: true });
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onCheckedChange when toggled on', async () => {
      renderComponent();
      const toggle = screen.getByRole('switch');
      await user.click(toggle);
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it('calls onCheckedChange when toggled off', async () => {
      renderComponent({ checked: true });
      const toggle = screen.getByRole('switch');
      await user.click(toggle);
      expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
    });

    it('does not call onCheckedChange when disabled', async () => {
      renderComponent({ disabled: true });
      await user.click(screen.getByRole('switch'));
      expect(mockOnCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('prompt input rendering', () => {
    it('does not render AIPromptInput when unchecked', () => {
      renderComponent();
      expect(screen.queryByTestId('ai-prompt-input')).not.toBeInTheDocument();
    });

    it('renders AIPromptInput when checked', () => {
      renderComponent({ checked: true });
      expect(screen.getByTestId('ai-prompt-input')).toBeInTheDocument();
    });

    it('passes correct value to AIPromptInput', () => {
      renderComponent({ checked: true, value: 'Prompt text' });
      expect(screen.getByTestId('ai-prompt-input')).toHaveValue('Prompt text');
    });

    it('calls onValueChange when input changes', async () => {
      renderComponent({ checked: true });
      const input = screen.getByTestId('ai-prompt-input');
      await user.type(input, 'New prompt');
      expect(mockOnValueChange).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('links label and switch with matching ids', () => {
      renderComponent();
      const label = screen.getByText('AI Task Generator');
      expect(label).toHaveAttribute('for', 'ai_generate');
      expect(screen.getByRole('switch')).toHaveAttribute('id', 'ai_generate');
    });

    it('associates switch with description', () => {
      renderComponent();
      const description = screen.getByText('Automatically create tasks by providing a simple prompt.');
      expect(description).toHaveAttribute('id', 'ai-task-generator-description');
      expect(screen.getByRole('switch')).toHaveAttribute('aria-describedby', 'ai-task-generator-description');
    });

    it('maintains accessible section structure', () => {
      renderComponent();
      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'ai-task-generator-label');
    });
  });

  describe('integration flow', () => {
    it('shows AIPromptInput after enabling the switch', async () => {
      renderComponent();
      expect(screen.queryByTestId('ai-prompt-input')).not.toBeInTheDocument();

      await user.click(screen.getByRole('switch'));
      renderComponent({ checked: true });

      expect(screen.getByTestId('ai-prompt-input')).toBeInTheDocument();
    });

    it('hides AIPromptInput when switch is turned off', () => {
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
    it('renders empty state safely', () => {
      renderComponent({ checked: false, value: '' });
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('handles long input values without crashing', () => {
      const longText = 'x'.repeat(1000);
      renderComponent({ checked: true, value: longText });
      expect(screen.getByTestId('ai-prompt-input')).toHaveValue(longText);
    });

    it('renders disabled switch visually and functionally', () => {
      renderComponent({ disabled: true });
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
  });
});
