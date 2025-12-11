import { createMockProjectListItem } from '@/core/test-setup/factories';
import type { ProjectListItem, SelectedProject } from '@/features/projects/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPicker } from '@/features/projects/components/molecules/ProjectPicker/ProjectPicker';

const mockProjects: ProjectListItem[] = [
  createMockProjectListItem({ $id: '1', name: 'Project Alpha', color_name: 'red', color_hex: '#FF0000' }),
  createMockProjectListItem({ $id: '2', name: 'Project Beta', color_name: 'green', color_hex: '#00FF00' }),
  createMockProjectListItem({ $id: '3', name: 'Project Gamma', color_name: 'blue', color_hex: '#0000FF' }),
];

const mockSelectedProject: SelectedProject = {
  id: '1',
  name: 'Project Alpha',
  colorHex: '#FF0000',
};

const mockInboxSelection: SelectedProject = {
  id: null,
  name: '',
  colorHex: '',
};

interface IconProps {
  color?: string;
  className?: string;
}

interface PopoverProps {
  children: React.ReactNode;
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: string;
  children: React.ReactNode;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  asChild?: boolean;
}

interface SelectableCommandItemProps {
  id: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
}

interface CommandProps {
  children: React.ReactNode;
}

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}
vi.mock('lucide-react', () => ({
  Hash: ({ color, ...props }: IconProps) => (
    <svg
      data-testid="hash-icon"
      data-color={color}
      aria-hidden="true"
      {...props}
    />
  ),
  Inbox: (props: IconProps) => (
    <svg
      data-testid="inbox-icon"
      aria-hidden="true"
      {...props}
    />
  ),
  ChevronDown: ({ className, ...props }: IconProps) => (
    <svg
      data-testid="chevron-down-icon"
      className={className}
      aria-hidden="true"
      {...props}
    />
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: ButtonProps) => <button {...props}>{children}</button>,
}));

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({ children }: PopoverProps) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: PopoverProps) => <div>{children}</div>,
  PopoverContent: ({ children, ...props }: PopoverContentProps) => (
    <div
      data-testid="popover-content"
      {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/command', () => ({
  Command: ({ children }: CommandProps) => <div data-testid="command">{children}</div>,
  CommandInput: (props: CommandInputProps) => (
    <input
      data-testid="command-input"
      type="text"
      {...props}
    />
  ),
  CommandList: ({ children }: CommandProps) => <div data-testid="command-list">{children}</div>,
  CommandEmpty: ({ children }: CommandProps) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children }: CommandProps) => <div data-testid="command-group">{children}</div>,
}));

vi.mock('@/shared/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/components/atoms/SelectableCommandItem/SelectableCommandItem', () => ({
  SelectableCommandItem: ({ id, label, selected, onSelect, icon }: SelectableCommandItemProps) => (
    <div
      data-testid={`selectable-item-${id}`}
      data-selected={selected}
      role="option"
      aria-selected={selected}
      onClick={onSelect}>
      {icon}
      <span>{label}</span>
    </div>
  ),
}));

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => ({
    isOpen: false,
    setIsOpen: vi.fn(),
    close: vi.fn(),
    open: vi.fn(),
  }),
}));

describe('ProjectPicker', () => {
  const mockOnValueChange = vi.fn();

  interface RenderOptions {
    value?: SelectedProject;
    projects?: ProjectListItem[];
    disabled?: boolean;
  }

  const renderComponent = ({
    value = mockInboxSelection,
    projects = mockProjects,
    disabled = false,
  }: RenderOptions = {}) => {
    return render(
      <ProjectPicker
        value={value}
        projects={projects}
        onValueChange={mockOnValueChange}
        disabled={disabled}
      />
    );
  };

  const getTriggerButton = () => screen.getByRole('combobox', { name: /select project/i });
  const getProjectItem = (id: string) => screen.getByTestId(`selectable-item-${id}`);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render trigger button with Inbox when no project is selected', () => {
      renderComponent();

      const button = getTriggerButton();
      expect(button).toHaveAttribute('type', 'button');
      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(screen.getByTestId('inbox-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should render trigger button with selected project name and colored icon', () => {
      renderComponent({ value: mockSelectedProject });

      expect(screen.getAllByText('Project Alpha')[0]).toBeInTheDocument();
      const hashIcon = screen.getAllByTestId('hash-icon')[0];
      expect(hashIcon).toHaveAttribute('data-color', '#FF0000');
    });

    it('should render all projects in the list with search input', () => {
      renderComponent();

      mockProjects.forEach((project) => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });

      const input = screen.getByTestId('command-input');
      expect(input).toHaveAttribute('placeholder', 'Search project...');
      expect(input).toHaveAttribute('aria-label', 'Search project');
    });

    it('should render empty state message', () => {
      renderComponent();

      expect(screen.getByTestId('command-empty')).toHaveTextContent('No project found.');
    });
  });

  describe('disabled state', () => {
    it('should disable trigger button when disabled prop is true', () => {
      renderComponent({ disabled: true });

      expect(getTriggerButton()).toBeDisabled();
    });

    it('should enable trigger button when disabled prop is false', () => {
      renderComponent({ disabled: false });

      expect(getTriggerButton()).not.toBeDisabled();
    });
  });

  describe('project selection', () => {
    it('should call onValueChange with project data when unselected project is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getProjectItem('2'));

      expect(mockOnValueChange).toHaveBeenCalledWith({
        id: '2',
        name: 'Project Beta',
        colorHex: '#00FF00',
      });
      expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    });

    it('should deselect project when clicking already selected project', async () => {
      const user = userEvent.setup();
      renderComponent({ value: mockSelectedProject });

      await user.click(getProjectItem('1'));

      expect(mockOnValueChange).toHaveBeenCalledWith({
        id: null,
        name: '',
        colorHex: '',
      });
    });

    it('should switch to different project when another project is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ value: mockSelectedProject });

      await user.click(getProjectItem('3'));

      expect(mockOnValueChange).toHaveBeenCalledWith({
        id: '3',
        name: 'Project Gamma',
        colorHex: '#0000FF',
      });
    });

    it('should mark selected project with correct aria-selected attribute', () => {
      renderComponent({ value: mockSelectedProject });

      const selectedItem = getProjectItem('1');
      expect(selectedItem).toHaveAttribute('data-selected', 'true');
      expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('edge cases', () => {
    it('should handle empty projects array', () => {
      renderComponent({ projects: [] });

      expect(getTriggerButton()).toBeInTheDocument();
      expect(screen.getByTestId('command-empty')).toBeInTheDocument();
    });

    it('should handle projects with special characters in names', () => {
      const specialProjects: ProjectListItem[] = [
        createMockProjectListItem({ $id: '1', name: 'Project #1 @ 2024', color_hex: '#FF0000' }),
        createMockProjectListItem({ $id: '2', name: 'Test & Development', color_hex: '#00FF00' }),
      ];

      renderComponent({ projects: specialProjects });

      expect(screen.getByText('Project #1 @ 2024')).toBeInTheDocument();
      expect(screen.getByText('Test & Development')).toBeInTheDocument();
    });

    it('should truncate long project names', () => {
      const longNameProject: SelectedProject = {
        id: '1',
        name: 'This is a very long project name that should be truncated in the UI',
        colorHex: '#FF0000',
      };

      renderComponent({ value: longNameProject });

      expect(screen.getByText(longNameProject.name)).toHaveClass('truncate');
    });

    it('should update display when value changes from Inbox to project', () => {
      const { rerender } = renderComponent({ value: mockInboxSelection });

      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(screen.getByTestId('inbox-icon')).toBeInTheDocument();

      rerender(
        <ProjectPicker
          value={mockSelectedProject}
          projects={mockProjects}
          onValueChange={mockOnValueChange}
          disabled={false}
        />
      );

      expect(screen.getAllByText('Project Alpha')[0]).toBeInTheDocument();
      expect(screen.queryByTestId('inbox-icon')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes on trigger button and popover', () => {
      renderComponent();

      const button = getTriggerButton();
      expect(button).toHaveAttribute('role', 'combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-label', 'Select project');

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('role', 'listbox');
      expect(content).toHaveAttribute('aria-label', 'Project list');
    });

    it('should render project options with correct role', () => {
      renderComponent({ value: mockSelectedProject });

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(mockProjects.length);
    });

    it('should hide decorative icons from screen readers', () => {
      renderComponent({ value: mockSelectedProject });

      const icons = [...screen.getAllByTestId('hash-icon'), screen.getByTestId('chevron-down-icon')];
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
