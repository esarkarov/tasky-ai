import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ColorPicker } from './ColorPicker';

vi.mock('lucide-react', () => ({
  ChevronDown: (props: Record<string, unknown>) => (
    <svg
      data-testid="chevron-down-icon"
      {...props}
    />
  ),
  Circle: (props: Record<string, unknown>) => (
    <svg
      data-testid="circle-icon"
      {...props}
    />
  ),
  Check: (props: Record<string, unknown>) => (
    <svg
      data-testid="check-icon"
      {...props}
    />
  ),
}));

vi.mock('@/features/projects/constants', () => ({
  PROJECT_COLORS: [
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#00FF00' },
  ],
}));

vi.mock('@/shared/components/atoms/SelectableCommandItem/SelectableCommandItem', () => ({
  SelectableCommandItem: ({
    id,
    value,
    selected,
    onSelect,
    icon,
    label,
  }: {
    id: string;
    value: string;
    selected: boolean;
    onSelect: () => void;
    icon: React.ReactNode;
    label: string;
  }) => (
    <div
      role="option"
      data-testid={`selectable-command-item-${id}`}
      data-selected={selected}
      onClick={onSelect}
      defaultValue={value}
      aria-selected={selected}>
      {icon}
      <span>{label}</span>
    </div>
  ),
}));

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    <div
      data-testid="popover"
      data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children, role }: { children: React.ReactNode; role?: string }) => (
    <div
      data-testid="popover-content"
      role={role}>
      {children}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/command', () => ({
  Command: ({ children }: { children: React.ReactNode }) => <div data-testid="command">{children}</div>,
  CommandInput: ({ placeholder, disabled }: { placeholder: string; disabled?: boolean }) => (
    <input
      data-testid="command-input"
      placeholder={placeholder}
      disabled={disabled}
      aria-label="Search color"
    />
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => <div data-testid="command-list">{children}</div>,
  CommandEmpty: ({ children }: { children: React.ReactNode }) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="command-group">{children}</div>,
}));

vi.mock('@/shared/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

describe('ColorPicker', () => {
  const mockOnOpenChange = vi.fn();
  const mockHandleColorSelect = vi.fn();
  const mockValue = { name: 'Red', hex: '#FF0000' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render label', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      expect(screen.getByText('Color')).toBeInTheDocument();
    });

    it('should render trigger button with current color', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={{ name: 'Red', hex: '#FF0000' }}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const triggerButton = screen.getByRole('button');
      expect(within(triggerButton).getByText('Red')).toBeInTheDocument();
    });

    it('should render ChevronDown icon', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should show selected color name in the trigger button', () => {
      const value = { name: 'Green', hex: '#00FF00' };

      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={value}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const triggerButton = screen.getByRole('button');
      expect(within(triggerButton).getByText(value.name)).toBeInTheDocument();
    });
  });

  describe('popover state', () => {
    it('should show popover as closed when open is false', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'false');
    });

    it('should show popover as open when open is true', () => {
      render(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'true');
    });

    it('should render color options when open', () => {
      render(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      expect(screen.getByTestId('selectable-command-item-Red')).toBeInTheDocument();
      expect(screen.getByTestId('selectable-command-item-Blue')).toBeInTheDocument();
      expect(screen.getByTestId('selectable-command-item-Green')).toBeInTheDocument();
    });
  });

  describe('color selection', () => {
    it('should call handleColorSelect when color is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const blueOption = screen.getByTestId('selectable-command-item-Blue');
      await user.click(blueOption);

      expect(mockHandleColorSelect).toHaveBeenCalledWith('Blue=#0000FF');
    });

    it('should mark current color as selected', () => {
      render(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const redOption = screen.getByTestId('selectable-command-item-Red');
      expect(redOption).toHaveAttribute('data-selected', 'true');
    });

    it('should not mark other colors as selected', () => {
      render(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const blueOption = screen.getByTestId('selectable-command-item-Blue');
      const greenOption = screen.getByTestId('selectable-command-item-Green');

      expect(blueOption).toHaveAttribute('data-selected', 'false');
      expect(greenOption).toHaveAttribute('data-selected', 'false');
    });
  });

  describe('search functionality', () => {
    it('should render search input when open', () => {
      render(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search color...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render empty state message', () => {
      render(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      expect(screen.getByText('No color found.')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable trigger button when disabled', () => {
      render(
        <ColorPicker
          open={false}
          disabled={true}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable search input when disabled', () => {
      render(
        <ColorPicker
          open={true}
          disabled={true}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search color...');
      expect(searchInput).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on trigger button', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Select project color (currently Red)');
    });

    it('should update aria-label with current color', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={{ name: 'Green', hex: '#00FF00' }}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Select project color (currently Green)');
    });

    it('should have aria-haspopup on trigger button', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should have aria-expanded reflecting open state', () => {
      const { rerender } = render(
        <ColorPicker
          open={false}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      rerender(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have listbox role on popover content', () => {
      render(
        <ColorPicker
          open={true}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const popoverContent = screen.getByTestId('popover-content');
      expect(popoverContent).toHaveAttribute('role', 'listbox');
    });

    it('should hide icons from screen readers', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const icons = screen.getAllByTestId('circle-icon');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });

      const chevron = screen.getByTestId('chevron-down-icon');
      expect(chevron).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('label association', () => {
    it('should link label to trigger button', () => {
      render(
        <ColorPicker
          open={false}
          disabled={false}
          value={mockValue}
          onOpenChange={mockOnOpenChange}
          handleColorSelect={mockHandleColorSelect}
        />
      );

      const label = screen.getByText('Color');
      expect(label).toHaveAttribute('for', 'color');

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'color');
    });
  });
});
