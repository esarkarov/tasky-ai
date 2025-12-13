import { SelectableCommandItem } from '@/shared/components/atoms/SelectableCommandItem/SelectableCommandItem';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  interface RenderOptions {
    id?: string;
    value?: string;
    label?: string;
    icon?: React.ReactNode;
    selected?: boolean;
    onSelect?: () => void;
  }

  const renderComponent = ({
    id = 'item-1',
    value = 'test-value',
    label = 'Test Item',
    icon = <span data-testid="custom-icon">🔵</span>,
    selected = false,
    onSelect = vi.fn(),
  }: RenderOptions = {}) => {
    return render(
      <SelectableCommandItem
        id={id}
        value={value}
        label={label}
        icon={icon}
        selected={selected}
        onSelect={onSelect}
      />
    );
  };

  const getCommandItem = () => screen.getByTestId('command-item');
  const getCheckIcon = () => screen.queryByTestId('check-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render label, icon, and correct value with role option', () => {
      renderComponent();

      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();

      const item = getCommandItem();
      expect(item).toHaveAttribute('data-value', 'test-value');
      expect(item).toHaveAttribute('role', 'option');
    });

    it('should render different icon types', () => {
      renderComponent({ icon: <span data-testid="text-icon">📁</span> });
      expect(screen.getByTestId('text-icon')).toBeInTheDocument();

      renderComponent({
        icon: (
          <svg data-testid="svg-icon">
            <circle
              cx="10"
              cy="10"
              r="5"
            />
          </svg>
        ),
      });
      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });

    it('should render label variations', () => {
      const longLabel = 'This is a very long label that might wrap to multiple lines';
      renderComponent({ label: longLabel });
      expect(screen.getByText(longLabel)).toBeInTheDocument();

      const specialLabel = 'Project #1 (Active) & Ready!';
      renderComponent({ label: specialLabel });
      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });
  });

  describe('selected state', () => {
    it('should show check icon with correct styling when selected', () => {
      renderComponent({ selected: true });

      const checkIcon = getCheckIcon();
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveClass('ms-auto');
      expect(checkIcon).toHaveAttribute('aria-hidden', 'true');
      expect(getCommandItem()).toHaveAttribute('aria-selected', 'true');
    });

    it('should not show check icon when not selected', () => {
      renderComponent({ selected: false });

      expect(getCheckIcon()).not.toBeInTheDocument();
      expect(getCommandItem()).toHaveAttribute('aria-selected', 'false');
    });

    it('should update check icon and aria-selected when selected state changes', () => {
      const { rerender } = renderComponent({ selected: false });

      expect(getCheckIcon()).not.toBeInTheDocument();
      expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'false');

      rerender(
        <SelectableCommandItem
          id="item-1"
          value="test-value"
          label="Test Item"
          icon={<span data-testid="custom-icon">🔵</span>}
          selected={true}
          onSelect={vi.fn()}
        />
      );

      expect(getCheckIcon()).toBeInTheDocument();
      expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('user interactions', () => {
    it('should call onSelect when clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderComponent({ onSelect });

      await user.click(getCommandItem());

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect on repeated clicks', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderComponent({ onSelect });

      const item = getCommandItem();
      await user.click(item);
      await user.click(item);
      await user.click(item);

      expect(onSelect).toHaveBeenCalledTimes(3);
    });
  });
});
