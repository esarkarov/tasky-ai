import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AITaskGenerator } from './AITaskGenerator';

vi.mock('lucide-react', () => ({
  Bot: (props: Record<string, unknown>) => (
    <svg
      data-testid="bot-icon"
      {...props}
    />
  ),
}));

vi.mock('@/components/molecules/AIPromptInput/AIPromptInput', () => ({
  AIPromptInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="ai-prompt-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="AI Prompt"
    />
  ),
}));

vi.mock('@/components/ui/switch', () => ({
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
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled}
      {...props}>
      {checked ? 'On' : 'Off'}
    </button>
  ),
}));

describe('AITaskGenerator', () => {
  const mockOnCheckedChange = vi.fn();
  const mockOnValueChange = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  const renderComponent = (
    props: {
      checked?: boolean;
      value?: string;
      disabled?: boolean;
    } = {}
  ) => {
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

  describe('basic rendering', () => {
    it('should render title and description', () => {
      renderComponent();

      expect(screen.getByText('AI Task Generator')).toBeInTheDocument();
      expect(screen.getByText('Automatically create tasks by providing a simple prompt.')).toBeInTheDocument();
    });

    it('should render Bot icon', () => {
      renderComponent();
      const icon = screen.getByTestId('bot-icon');

      expect(icon).toBeInTheDocument();
    });

    it('should render switch', () => {
      renderComponent();

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should have correct section structure', () => {
      renderComponent();

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby', 'ai-task-generator-label');
    });
  });

  describe('switch behavior', () => {
    it('should show switch as unchecked when checked is false', () => {
      renderComponent();
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should show switch as checked when checked is true', () => {
      renderComponent({ checked: true });
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should call onCheckedChange when switch is clicked', async () => {
      renderComponent();
      const switchElement = screen.getByRole('switch');

      await user.click(switchElement);

      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle from checked to unchecked', async () => {
      renderComponent({ checked: true });
      const switchElement = screen.getByRole('switch');

      await user.click(switchElement);

      expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
    });

    it('should disable switch when disabled prop is true', () => {
      renderComponent({ disabled: true });
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toBeDisabled();
    });

    it('should not call onCheckedChange when switch is disabled', async () => {
      renderComponent({ disabled: true });
      const switchElement = screen.getByRole('switch');

      await user.click(switchElement);

      expect(mockOnCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('conditional rendering', () => {
    it('should not show AIPromptInput when unchecked', () => {
      renderComponent();

      expect(screen.queryByTestId('ai-prompt-input')).not.toBeInTheDocument();
    });

    it('should show AIPromptInput when checked', () => {
      renderComponent({ checked: true });

      expect(screen.getByTestId('ai-prompt-input')).toBeInTheDocument();
    });

    it('should pass value to AIPromptInput', () => {
      renderComponent({ checked: true, value: 'Test prompt' });
      const promptInput = screen.getByTestId('ai-prompt-input');

      expect(promptInput).toHaveValue('Test prompt');
    });

    it('should call onValueChange when prompt changes', async () => {
      renderComponent({ checked: true });
      const promptInput = screen.getByTestId('ai-prompt-input');

      await user.type(promptInput, 'New prompt');

      expect(mockOnValueChange).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-labelledby on section', () => {
      renderComponent();
      const section = screen.getByRole('region');

      expect(section).toHaveAttribute('aria-labelledby', 'ai-task-generator-label');
    });

    it('should link label to switch', () => {
      renderComponent();
      const label = screen.getByText('AI Task Generator');
      const switchElement = screen.getByRole('switch');

      expect(label).toHaveAttribute('for', 'ai_generate');
      expect(switchElement).toHaveAttribute('id', 'ai_generate');
    });

    it('should have description with correct id', () => {
      renderComponent();
      const description = screen.getByText('Automatically create tasks by providing a simple prompt.');

      expect(description).toHaveAttribute('id', 'ai-task-generator-description');
    });

    it('should link switch to description via aria-describedby', () => {
      renderComponent();
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-describedby', 'ai-task-generator-description');
    });

    it('should hide Bot icon from screen readers', () => {
      renderComponent();
      const icon = screen.getByTestId('bot-icon');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('integration', () => {
    it('should show prompt input after enabling switch', async () => {
      renderComponent();
      const toggle = screen.getByRole('switch');

      expect(screen.queryByTestId('ai-prompt-input')).not.toBeInTheDocument();

      await user.click(toggle);

      renderComponent({ checked: true });

      expect(screen.getByTestId('ai-prompt-input')).toBeInTheDocument();
    });

    it('should hide prompt input after disabling switch', () => {
      const { rerender } = renderComponent({ checked: true, value: '   Some text' });

      expect(screen.getByTestId('ai-prompt-input')).toBeInTheDocument();

      rerender(
        <AITaskGenerator
          checked={false}
          value="Some text"
          onCheckedChange={mockOnCheckedChange}
          onValueChange={mockOnValueChange}
          disabled={false}
        />
      );

      expect(screen.queryByTestId('ai-prompt-input')).not.toBeInTheDocument();
    });
  });
});
