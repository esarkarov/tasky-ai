import { ProjectListItem } from '@/features/projects/types';
import { FilterSelect } from '@/shared/components/organisms/FilterSelect/FilterSelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

let mockOnValueChange: Mock | null = null;

interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
}

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: SelectProps) => {
    mockOnValueChange = onValueChange as Mock;
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
  SelectItem: ({ children, value }: SelectItemProps) => (
    <div
      data-testid={`select-item-${value}`}
      data-value={value}
      onClick={() => mockOnValueChange?.(value)}>
      {children}
    </div>
  ),
}));

const createProject = (id: string, name: string): ProjectListItem => ({
  $id: id,
  name,
  color_hex: '#FF0000',
  color_name: 'red',
  $createdAt: '2024-01-01',
  $updatedAt: '2024-01-01',
  $collectionId: 'col1',
  $databaseId: 'db1',
  $permissions: [],
});

describe('FilterSelect', () => {
  const mockHandleValueChange = vi.fn();
  const mockProjects: ProjectListItem[] = [
    createProject('proj-1', 'Project Alpha'),
    createProject('proj-2', 'Project Beta'),
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

  describe('basic rendering', () => {
    it('should render select with trigger, content, and all options', () => {
      render(<FilterSelect {...defaultProps} />);

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
      expect(screen.getAllByText('All Projects')[0]).toBeInTheDocument();

      expect(screen.getByTestId('select-item-all')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-inbox')).toBeInTheDocument();
      expect(screen.getByText('Inbox')).toBeInTheDocument();

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
    it('should display "all" when value is null', () => {
      render(<FilterSelect {...defaultProps} />);

      expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'all');
    });

    it('should display selected project value', () => {
      render(
        <FilterSelect
          {...defaultProps}
          value="proj-1"
        />
      );

      expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'proj-1');
    });

    it('should display inbox value', () => {
      render(
        <FilterSelect
          {...defaultProps}
          value="inbox"
        />
      );

      expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'inbox');
    });
  });

  describe('selection behavior', () => {
    it('should call handleValueChange with null when selecting "all"', async () => {
      const user = userEvent.setup();
      render(<FilterSelect {...defaultProps} />);

      await user.click(screen.getByTestId('select-item-all'));

      expect(mockHandleValueChange).toHaveBeenCalledWith(null);
      expect(mockHandleValueChange).toHaveBeenCalledTimes(1);
    });

    it('should call handleValueChange with project id when selecting project', async () => {
      const user = userEvent.setup();
      render(<FilterSelect {...defaultProps} />);

      await user.click(screen.getByTestId('select-item-proj-1'));

      expect(mockHandleValueChange).toHaveBeenCalledWith('proj-1');
      expect(mockHandleValueChange).toHaveBeenCalledTimes(1);
    });

    it('should call handleValueChange with "inbox" when selecting inbox', async () => {
      const user = userEvent.setup();
      render(<FilterSelect {...defaultProps} />);

      await user.click(screen.getByTestId('select-item-inbox'));

      expect(mockHandleValueChange).toHaveBeenCalledWith('inbox');
      expect(mockHandleValueChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle single project correctly', () => {
      render(
        <FilterSelect
          {...defaultProps}
          projects={[mockProjects[0]]}
        />
      );

      expect(screen.getByTestId('select-item-proj-1')).toBeInTheDocument();
      expect(screen.queryByTestId('select-item-proj-2')).not.toBeInTheDocument();
    });

    it('should handle project with special characters in name', () => {
      const specialProject = createProject('proj-special', 'Project & Test <>');

      render(
        <FilterSelect
          {...defaultProps}
          projects={[specialProject]}
        />
      );

      expect(screen.getByText('Project & Test <>')).toBeInTheDocument();
    });
  });
});
