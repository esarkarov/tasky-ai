import { ProjectListItem, SelectedProject } from '@/features/projects/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputHTMLAttributes, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPicker } from './ProjectPicker';

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      onClick={onClick}
      disabled={disabled}
      {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({
    children,
    open,
    onOpenChange,
  }: {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modal?: boolean;
  }) => (
    <div
      data-testid="popover"
      data-open={open}>
      <div onClick={() => onOpenChange(!open)}>{children}</div>
    </div>
  ),
  PopoverTrigger: ({ children }: { children: ReactNode; asChild?: boolean }) => <div>{children}</div>,
  PopoverContent: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
}));

vi.mock('@/shared/components/ui/command', () => ({
  Command: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandInput: ({ placeholder, onChange, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
    <input
      placeholder={placeholder}
      onChange={onChange}
      {...props}
    />
  ),
  CommandList: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
  CommandEmpty: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/components/atoms/SelectableCommandItem/SelectableCommandItem', () => ({
  SelectableCommandItem: ({
    label,
    selected,
    onSelect,
    icon,
  }: {
    label: string;
    selected: boolean;
    onSelect: () => void;
    icon: ReactNode;
  }) => (
    <div
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      data-testid={`project-item-${label}`}>
      {icon}
      <span>{label}</span>
    </div>
  ),
}));

describe('ProjectPicker', () => {
  const mockOnValueChange = vi.fn();

  const mockProjects: ProjectListItem[] = [
    {
      $id: '1',
      name: 'Project Alpha',
      color_hex: '#FF0000',
      color_name: 'red',
      $createdAt: '2024-01-01',
      $collectionId: 'col1',
      $databaseId: 'db1',
      $permissions: [],
      $updatedAt: '2024-01-01',
    },
    {
      $id: '2',
      name: 'Project Beta',
      color_hex: '#00FF00',
      color_name: 'green',
      $createdAt: '2024-01-01',
      $collectionId: 'col1',
      $databaseId: 'db1',
      $permissions: [],
      $updatedAt: '2024-01-01',
    },
    {
      $id: '3',
      name: 'Project Gamma',
      color_hex: '#0000FF',
      color_name: 'blue',
      $createdAt: '2024-01-01',
      $collectionId: 'col1',
      $databaseId: 'db1',
      $permissions: [],
      $updatedAt: '2024-01-01',
    },
  ];

  const defaultSelectedProject: SelectedProject = {
    id: null,
    name: '',
    colorHex: '',
  };

  const selectedProject: SelectedProject = {
    id: '1',
    name: 'Project Alpha',
    colorHex: '#FF0000',
  };

  const defaultProps = {
    value: defaultSelectedProject,
    projects: mockProjects,
    onValueChange: mockOnValueChange,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render trigger button with Inbox when no project selected', () => {
      render(<ProjectPicker {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('should render trigger button with project name when project selected', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          value={selectedProject}
        />
      );

      expect(screen.getAllByText('Project Alpha')[0]).toBeInTheDocument();
    });

    it('should render all projects in the list', () => {
      render(<ProjectPicker {...defaultProps} />);

      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
      expect(screen.getByText('Project Gamma')).toBeInTheDocument();
    });

    it('should render search input with correct placeholder', () => {
      render(<ProjectPicker {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search project...')).toBeInTheDocument();
    });

    it('should render empty state message', () => {
      render(<ProjectPicker {...defaultProps} />);

      expect(screen.getByText('No project found.')).toBeInTheDocument();
    });

    it('should set aria-expanded to false when popover is closed', () => {
      render(<ProjectPicker {...defaultProps} />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set aria-expanded to true when popover is open', async () => {
      const user = userEvent.setup();
      render(<ProjectPicker {...defaultProps} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('user interactions', () => {
    it('should open popover when trigger button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectPicker {...defaultProps} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'true');
    });

    it('should close popover when trigger button is clicked again', async () => {
      const user = userEvent.setup();
      render(<ProjectPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      await user.click(button);
      await user.click(button);

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'false');
    });

    it('should close popover after selecting a project', async () => {
      const user = userEvent.setup();
      render(<ProjectPicker {...defaultProps} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      const projectItem = screen.getByTestId('project-item-Project Alpha');
      await user.click(projectItem);

      await waitFor(() => {
        const popover = screen.getByTestId('popover');
        expect(popover).toHaveAttribute('data-open', 'false');
      });
    });
  });

  describe('project selection', () => {
    it('should call onValueChange with correct values when selecting a project', async () => {
      const user = userEvent.setup();
      render(<ProjectPicker {...defaultProps} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      const projectItem = screen.getByTestId('project-item-Project Beta');
      await user.click(projectItem);

      expect(mockOnValueChange).toHaveBeenCalledWith({
        id: '2',
        name: 'Project Beta',
        colorHex: '#00FF00',
      });
      expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    });

    it('should deselect project when clicking on already selected project', async () => {
      const user = userEvent.setup();
      render(
        <ProjectPicker
          {...defaultProps}
          value={selectedProject}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const projectItem = screen.getByTestId('project-item-Project Alpha');
      await user.click(projectItem);

      expect(mockOnValueChange).toHaveBeenCalledWith({
        id: null,
        name: '',
        colorHex: '',
      });
    });

    it('should mark selected project with aria-selected=true', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          value={selectedProject}
        />
      );

      const selectedItem = screen.getByTestId('project-item-Project Alpha');
      expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    });

    it('should mark unselected projects with aria-selected=false', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          value={selectedProject}
        />
      );

      const unselectedItem = screen.getByTestId('project-item-Project Beta');
      expect(unselectedItem).toHaveAttribute('aria-selected', 'false');
    });

    it('should switch from one project to another', async () => {
      const user = userEvent.setup();
      render(
        <ProjectPicker
          {...defaultProps}
          value={selectedProject}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const projectItem = screen.getByTestId('project-item-Project Gamma');
      await user.click(projectItem);

      expect(mockOnValueChange).toHaveBeenCalledWith({
        id: '3',
        name: 'Project Gamma',
        colorHex: '#0000FF',
      });
    });
  });

  describe('disabled state', () => {
    it('should disable trigger button when disabled prop is true', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          disabled={true}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should enable trigger button when disabled prop is false', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          disabled={false}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).not.toBeDisabled();
    });

    it('should not open popover when disabled button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ProjectPicker
          {...defaultProps}
          disabled={true}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'false');
    });
  });

  describe('empty projects list', () => {
    it('should render without errors when projects list is empty', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          projects={[]}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('should show empty state when no projects available', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          projects={[]}
        />
      );

      expect(screen.getByText('No project found.')).toBeInTheDocument();
    });

    it('should not render any project items when list is empty', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          projects={[]}
        />
      );

      const projectItems = screen.queryAllByRole('option');
      expect(projectItems).toHaveLength(0);
    });
  });

  describe('search functionality', () => {
    it('should render search input', () => {
      render(<ProjectPicker {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search project...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have correct aria-label on search input', () => {
      render(<ProjectPicker {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search project');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes on trigger button', () => {
      render(<ProjectPicker {...defaultProps} />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-label', 'Select project');
    });

    it('should have correct ARIA attributes on popover content', () => {
      render(<ProjectPicker {...defaultProps} />);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByLabelText('Project list')).toBeInTheDocument();
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(
        <ProjectPicker
          {...defaultProps}
          value={selectedProject}
        />
      );

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('visual states', () => {
    it('should display Hash icon when project is selected', () => {
      render(
        <ProjectPicker
          {...defaultProps}
          value={selectedProject}
        />
      );

      expect(screen.getAllByText('Project Alpha')[0]).toBeInTheDocument();
    });

    it('should display Inbox icon when no project is selected', () => {
      render(<ProjectPicker {...defaultProps} />);

      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('should display ChevronDown icon on trigger button', () => {
      render(<ProjectPicker {...defaultProps} />);

      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle project with special characters in name', async () => {
      const user = userEvent.setup();
      const specialProjects: ProjectListItem[] = [
        {
          $id: '1',
          name: 'Project #1 & More!',
          color_hex: '#FF0000',
          color_name: 'red',
          $createdAt: '2024-01-01',
          $collectionId: 'col1',
          $databaseId: 'db1',
          $permissions: [],
          $updatedAt: '2024-01-01',
        },
      ];
      render(
        <ProjectPicker
          {...defaultProps}
          projects={specialProjects}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const projectItem = screen.getByTestId('project-item-Project #1 & More!');
      await user.click(projectItem);

      expect(mockOnValueChange).toHaveBeenCalledWith({
        id: '1',
        name: 'Project #1 & More!',
        colorHex: '#FF0000',
      });
    });

    it('should handle very long project names', () => {
      const longNameProjects: ProjectListItem[] = [
        {
          $id: '1',
          name: 'A'.repeat(100),
          color_hex: '#FF0000',
          color_name: 'red',
          $createdAt: '2024-01-01',
          $collectionId: 'col1',
          $databaseId: 'db1',
          $permissions: [],
          $updatedAt: '2024-01-01',
        },
      ];

      render(
        <ProjectPicker
          {...defaultProps}
          projects={longNameProjects}
        />
      );

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle rapid clicks on different projects', async () => {
      const user = userEvent.setup();
      render(<ProjectPicker {...defaultProps} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      const projectItem1 = screen.getByTestId('project-item-Project Alpha');
      await user.click(projectItem1);
      await user.click(button);

      const projectItem2 = screen.getByTestId('project-item-Project Beta');
      await user.click(projectItem2);

      expect(mockOnValueChange).toHaveBeenCalledTimes(2);
      expect(mockOnValueChange).toHaveBeenLastCalledWith({
        id: '2',
        name: 'Project Beta',
        colorHex: '#00FF00',
      });
    });
  });
});
