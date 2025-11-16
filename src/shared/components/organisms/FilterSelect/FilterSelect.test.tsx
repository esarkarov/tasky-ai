import { ProjectListItem } from '@/features/projects/types';
import { FilterSelect } from '@/shared/components/organisms/FilterSelect/FilterSelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockOnValueChange: ((value: string) => void) | null = null;

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => {
    mockOnValueChange = onValueChange;
    return (
      <div
        data-testid="select"
        data-value={value}>
        {children}
      </div>
    );
  },
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <button
      data-testid="select-trigger"
      className={className}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div
      data-testid="select-content"
      className={className}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div
      data-testid={`select-item-${value}`}
      data-value={value}
      onClick={() => mockOnValueChange?.(value)}>
      {children}
    </div>
  ),
}));

describe('FilterSelect', () => {
  const mockHandleValueChange = vi.fn();
  const mockProjects: ProjectListItem[] = [
    {
      $id: 'proj-1',
      name: 'Project Alpha',
      color_hex: '#FF0000',
      color_name: 'red',
      $createdAt: '2024-01-01',
      $updatedAt: '2024-01-01',
      $collectionId: 'col1',
      $databaseId: 'db1',
      $permissions: [],
    },
    {
      $id: 'proj-2',
      name: 'Project Beta',
      color_hex: '#00FF00',
      color_name: 'green',
      $createdAt: '2024-01-01',
      $updatedAt: '2024-01-01',
      $collectionId: 'col1',
      $databaseId: 'db1',
      $permissions: [],
    },
  ];

  const defaultProps = {
    value: null,
    projects: mockProjects,
    handleValueChange: mockHandleValueChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnValueChange = null;
  });

  describe('rendering', () => {
    it('should render select with trigger and content', () => {
      render(<FilterSelect {...defaultProps} />);

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
    });

    it('should render placeholder', () => {
      render(<FilterSelect {...defaultProps} />);

      expect(screen.getAllByText('All Projects')[0]).toBeInTheDocument();
    });

    it('should render All Projects option', () => {
      render(<FilterSelect {...defaultProps} />);

      expect(screen.getByTestId('select-item-all')).toBeInTheDocument();
      expect(screen.getAllByText('All Projects').length).toBeGreaterThan(0);
    });

    it('should render Inbox option', () => {
      render(<FilterSelect {...defaultProps} />);

      expect(screen.getByTestId('select-item-inbox')).toBeInTheDocument();
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('should render all project options', () => {
      render(<FilterSelect {...defaultProps} />);

      expect(screen.getByTestId('select-item-proj-1')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-proj-2')).toBeInTheDocument();
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });

    it('should render with empty projects list', () => {
      render(
        <FilterSelect
          {...defaultProps}
          projects={[]}
        />
      );

      expect(screen.getByTestId('select-item-all')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-inbox')).toBeInTheDocument();
      expect(screen.queryByTestId('select-item-proj-1')).not.toBeInTheDocument();
    });
  });

  describe('value handling', () => {
    it('should display all when value is null', () => {
      render(
        <FilterSelect
          {...defaultProps}
          value={null}
        />
      );

      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('data-value', 'all');
    });

    it('should display selected project value', () => {
      render(
        <FilterSelect
          {...defaultProps}
          value="proj-1"
        />
      );

      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('data-value', 'proj-1');
    });

    it('should display inbox value', () => {
      render(
        <FilterSelect
          {...defaultProps}
          value="inbox"
        />
      );

      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('data-value', 'inbox');
    });
  });

  describe('selection behavior', () => {
    it('should call handleValueChange with null when selecting all', async () => {
      const user = userEvent.setup();
      render(<FilterSelect {...defaultProps} />);

      const allItem = screen.getByTestId('select-item-all');
      await user.click(allItem);

      expect(mockHandleValueChange).toHaveBeenCalledWith(null);
    });

    it('should call handleValueChange with project id when selecting project', async () => {
      const user = userEvent.setup();
      render(<FilterSelect {...defaultProps} />);

      const projectItem = screen.getByTestId('select-item-proj-1');
      await user.click(projectItem);

      expect(mockHandleValueChange).toHaveBeenCalledWith('proj-1');
    });

    it('should call handleValueChange with inbox when selecting inbox', async () => {
      const user = userEvent.setup();
      render(<FilterSelect {...defaultProps} />);

      const inboxItem = screen.getByTestId('select-item-inbox');
      await user.click(inboxItem);

      expect(mockHandleValueChange).toHaveBeenCalledWith('inbox');
    });
  });

  describe('edge cases', () => {
    it('should handle single project', () => {
      const singleProject = [mockProjects[0]];
      render(
        <FilterSelect
          {...defaultProps}
          projects={singleProject}
        />
      );

      expect(screen.getByTestId('select-item-proj-1')).toBeInTheDocument();
      expect(screen.queryByTestId('select-item-proj-2')).not.toBeInTheDocument();
    });

    it('should handle project with special characters in name', () => {
      const specialProjects: ProjectListItem[] = [
        {
          ...mockProjects[0],
          $id: 'proj-special',
          name: 'Project & Test <>',
        },
      ];

      render(
        <FilterSelect
          {...defaultProps}
          projects={specialProjects}
        />
      );

      expect(screen.getByText('Project & Test <>')).toBeInTheDocument();
    });
  });
});
