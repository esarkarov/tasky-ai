import { ColorPicker } from '@/shared/components/molecules/ColorPicker/ColorPicker';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

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

interface SelectableCommandItemProps {
  id: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
}

vi.mock('@/shared/components/atoms/SelectableCommandItem/SelectableCommandItem', () => ({
  SelectableCommandItem: ({ id, value, selected, onSelect, icon, label }: SelectableCommandItemProps) => (
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

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverContentProps {
  children: React.ReactNode;
  role?: string;
  align?: string;
  className?: string;
  'aria-label'?: string;
}

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({ children, open }: PopoverProps) => (
    <div
      data-testid="popover"
      data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children, role }: PopoverContentProps) => (
    <div
      data-testid="popover-content"
      role={role}>
      {children}
    </div>
  ),
}));

interface CommandInputProps {
  placeholder: string;
  disabled?: boolean;
  'aria-label'?: string;
}

vi.mock('@/shared/components/ui/command', () => ({
  Command: ({ children }: { children: React.ReactNode }) => <div data-testid="command">{children}</div>,
  CommandInput: ({ placeholder, disabled, 'aria-label': ariaLabel }: CommandInputProps) => (
    <input
      data-testid="command-input"
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
    />
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => <div data-testid="command-list">{children}</div>,
  CommandEmpty: ({ children }: { children: React.ReactNode }) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="command-group">{children}</div>,
}));

vi.mock('@/shared/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

interface ColorPickerProps {
  open: boolean;
  disabled: boolean;
  value: { name: string; hex: string };
  onOpenChange: Mock;
  handleColorSelect: Mock;
}

const defaultProps: ColorPickerProps = {
  open: false,
  disabled: false,
  value: { name: 'Red', hex: '#FF0000' },
  onOpenChange: vi.fn(),
  handleColorSelect: vi.fn(),
};

const renderComponent = (props: Partial<ColorPickerProps> = {}) =>
  render(<ColorPicker {...{ ...defaultProps, ...props }} />);

describe('ColorPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render label and trigger button with current color', () => {
      renderComponent({ value: { name: 'Green', hex: '#00FF00' } });

      expect(screen.getByText('Color')).toBeInTheDocument();

      const triggerButton = screen.getByRole('button');
      expect(within(triggerButton).getByText('Green')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });

  describe('popover state', () => {
    it('should show closed popover when open is false', () => {
      renderComponent({ open: false });

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'false');
    });

    it('should show open popover with color options when open is true', () => {
      renderComponent({ open: true });

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'true');

      expect(screen.getByTestId('selectable-command-item-Red')).toBeInTheDocument();
      expect(screen.getByTestId('selectable-command-item-Blue')).toBeInTheDocument();
      expect(screen.getByTestId('selectable-command-item-Green')).toBeInTheDocument();
    });
  });

  describe('color selection', () => {
    it('should call handleColorSelect with correct value when color is clicked', async () => {
      const user = userEvent.setup();
      const handleColorSelect = vi.fn();

      renderComponent({ open: true, handleColorSelect });

      const blueOption = screen.getByTestId('selectable-command-item-Blue');
      await user.click(blueOption);

      expect(handleColorSelect).toHaveBeenCalledWith('Blue=#0000FF');
    });

    it('should mark only current color as selected', () => {
      renderComponent({ open: true, value: { name: 'Red', hex: '#FF0000' } });

      expect(screen.getByTestId('selectable-command-item-Red')).toHaveAttribute('data-selected', 'true');
      expect(screen.getByTestId('selectable-command-item-Blue')).toHaveAttribute('data-selected', 'false');
      expect(screen.getByTestId('selectable-command-item-Green')).toHaveAttribute('data-selected', 'false');
    });
  });

  describe('search functionality', () => {
    it('should render search input and empty state when open', () => {
      renderComponent({ open: true });

      expect(screen.getByPlaceholderText('Search color...')).toBeInTheDocument();
      expect(screen.getByText('No color found.')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable trigger button and search input when disabled', () => {
      renderComponent({ open: true, disabled: true });

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByPlaceholderText('Search color...')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have correct aria attributes on trigger button', () => {
      renderComponent({ value: { name: 'Green', hex: '#00FF00' } });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Select project color (currently Green)');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when popover opens', () => {
      const { rerender } = renderComponent({ open: false });

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');

      rerender(
        <ColorPicker
          {...defaultProps}
          open={true}
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have listbox role on popover content when open', () => {
      renderComponent({ open: true });

      expect(screen.getByTestId('popover-content')).toHaveAttribute('role', 'listbox');
    });

    it('should hide decorative icons from screen readers', () => {
      renderComponent();

      const circleIcons = screen.getAllByTestId('circle-icon');
      circleIcons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });

      expect(screen.getByTestId('chevron-down-icon')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('label association', () => {
    it('should correctly associate label with trigger button', () => {
      renderComponent();

      const label = screen.getByText('Color');
      expect(label).toHaveAttribute('for', 'color');

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'color');
    });
  });
});
