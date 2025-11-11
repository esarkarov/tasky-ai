import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SelectableCommandItem } from './SelectableCommandItem';

vi.mock('@/shared/components/ui/command', () => ({
  CommandItem: ({
    children,
    value,
    onSelect,
    role,
    'aria-selected': ariaSelected,
  }: {
    children: React.ReactNode;
    value: string;
    onSelect: () => void;
    role: string;
    'aria-selected': boolean;
  }) => (
    <div
      data-testid="command-item"
      data-value={value}
      role={role}
      aria-selected={ariaSelected}
      onClick={onSelect}>
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Check: ({ className }: { className: string }) => (
    <svg
      data-testid="check-icon"
      className={className}
      aria-hidden="true"
    />
  ),
}));

describe('SelectableCommandItem', () => {
  const mockProps = {
    id: 'item-1',
    value: 'test-value',
    label: 'Test Item',
    icon: <span data-testid="custom-icon">🔵</span>,
  };

  const setup = (selected = false) => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SelectableCommandItem
        {...mockProps}
        selected={selected}
        onSelect={onSelect}
      />
    );
    return { user, onSelect, item: screen.getByTestId('command-item') };
  };

  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders the label', () => {
      setup();
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('renders the icon', () => {
      setup();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('sets correct value', () => {
      const { item } = setup();
      expect(item).toHaveAttribute('data-value', 'test-value');
    });
  });

  describe('Selected state', () => {
    it('renders check icon when selected', () => {
      setup(true);
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('does not render check icon when not selected', () => {
      setup(false);
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });

    it('applies correct class to check icon', () => {
      setup(true);
      expect(screen.getByTestId('check-icon')).toHaveClass('ms-auto');
    });

    it('hides check icon from assistive technologies', () => {
      setup(true);
      expect(screen.getByTestId('check-icon')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('User interactions', () => {
    it('calls onSelect when clicked', async () => {
      const { user, onSelect, item } = setup();
      await user.click(item);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('calls onSelect multiple times on repeated clicks', async () => {
      const { user, onSelect, item } = setup();
      await user.click(item);
      await user.click(item);
      await user.click(item);
      expect(onSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has role option', () => {
      const { item } = setup();
      expect(item).toHaveAttribute('role', 'option');
    });

    it('sets aria-selected to false when not selected', () => {
      const { item } = setup(false);
      expect(item).toHaveAttribute('aria-selected', 'false');
    });

    it('sets aria-selected to true when selected', () => {
      const { item } = setup(true);
      expect(item).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('State transitions', () => {
    it('renders check icon when changing from false to true', () => {
      const { rerender } = render(
        <SelectableCommandItem
          {...mockProps}
          selected={false}
          onSelect={vi.fn()}
        />
      );
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
      rerender(
        <SelectableCommandItem
          {...mockProps}
          selected={true}
          onSelect={vi.fn()}
        />
      );
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('updates aria-selected when state changes', () => {
      const { rerender } = render(
        <SelectableCommandItem
          {...mockProps}
          selected={false}
          onSelect={vi.fn()}
        />
      );
      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('aria-selected', 'false');
      rerender(
        <SelectableCommandItem
          {...mockProps}
          selected={true}
          onSelect={vi.fn()}
        />
      );
      expect(item).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Icon variations', () => {
    it('renders text-based icon', () => {
      const icon = <span data-testid="text-icon">📁</span>;
      render(
        <SelectableCommandItem
          {...mockProps}
          icon={icon}
          selected={false}
          onSelect={vi.fn()}
        />
      );
      expect(screen.getByTestId('text-icon')).toBeInTheDocument();
    });

    it('renders SVG icon', () => {
      const icon = (
        <svg data-testid="svg-icon">
          <circle
            cx="10"
            cy="10"
            r="5"
          />
        </svg>
      );
      render(
        <SelectableCommandItem
          {...mockProps}
          icon={icon}
          selected={false}
          onSelect={vi.fn()}
        />
      );
      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });
  });

  describe('Label variations', () => {
    it('renders long label text', () => {
      const longLabel = 'This is a very long label that might wrap to multiple lines';
      render(
        <SelectableCommandItem
          {...mockProps}
          label={longLabel}
          selected={false}
          onSelect={vi.fn()}
        />
      );
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('renders label with special characters', () => {
      const specialLabel = 'Project #1 (Active) & Ready!';
      render(
        <SelectableCommandItem
          {...mockProps}
          label={specialLabel}
          selected={false}
          onSelect={vi.fn()}
        />
      );
      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });
  });
});
