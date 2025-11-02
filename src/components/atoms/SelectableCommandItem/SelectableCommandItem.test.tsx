import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SelectableCommandItem } from './SelectableCommandItem';

vi.mock('@/components/ui/command', () => ({
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
  const MOCK_ID = 'item-1';
  const MOCK_VALUE = 'test-value';
  const MOCK_LABEL = 'Test Item';
  const MOCK_ICON = <span data-testid="custom-icon">🔵</span>;

  let mockOnSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSelect = vi.fn();
  });

  describe('rendering', () => {
    it('should render label text', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      expect(screen.getByText(MOCK_LABEL)).toBeInTheDocument();
    });

    it('should render custom icon', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render with correct value attribute', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      const item = screen.getByTestId('command-item');
      expect(item).toHaveAttribute('data-value', MOCK_VALUE);
    });
  });

  describe('selected state', () => {
    it('should show check icon when selected', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={true}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should not show check icon when not selected', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });

    it('should apply correct class to check icon', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={true}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toHaveClass('ms-auto');
    });
  });

  describe('user interactions', () => {
    it('should call onSelect when item is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );
      const item = screen.getByTestId('command-item');

      await user.click(item);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect when selected item is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={true}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );
      const item = screen.getByTestId('command-item');

      await user.click(item);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect multiple times when clicked multiple times', async () => {
      const user = userEvent.setup();
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );
      const item = screen.getByTestId('command-item');

      await user.click(item);
      await user.click(item);
      await user.click(item);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility', () => {
    it('should have option role', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      const item = screen.getByRole('option');
      expect(item).toBeInTheDocument();
    });

    it('should have aria-selected false when not selected', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('aria-selected', 'false');
    });

    it('should have aria-selected true when selected', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={true}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('should hide check icon from screen readers', () => {
      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={true}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('state transitions', () => {
    it('should update check icon visibility when selected changes', () => {
      const { rerender } = render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();

      rerender(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={true}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should update aria-selected when selected changes', () => {
      const { rerender } = render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );
      const item = screen.getByRole('option');

      expect(item).toHaveAttribute('aria-selected', 'false');

      rerender(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={true}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={MOCK_LABEL}
        />
      );

      expect(item).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('different icon types', () => {
    it('should render text icon', () => {
      const textIcon = <span data-testid="text-icon">📁</span>;

      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={textIcon}
          label={MOCK_LABEL}
        />
      );

      expect(screen.getByTestId('text-icon')).toBeInTheDocument();
    });

    it('should render svg icon', () => {
      const svgIcon = (
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
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={svgIcon}
          label={MOCK_LABEL}
        />
      );

      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });
  });

  describe('different labels', () => {
    it('should render with long label', () => {
      const longLabel = 'This is a very long label that might wrap to multiple lines';

      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={longLabel}
        />
      );

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should render with special characters in label', () => {
      const specialLabel = 'Project #1 (Active) & Ready!';

      render(
        <SelectableCommandItem
          id={MOCK_ID}
          value={MOCK_VALUE}
          selected={false}
          onSelect={mockOnSelect}
          icon={MOCK_ICON}
          label={specialLabel}
        />
      );

      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });
  });
});
