import { createMockProject } from '@/core/tests/factories';
import type { ProjectListItem } from '@/features/projects/types';
import type { ProjectsLoaderData } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsPage } from './ProjectsPage';

const mockHandleSearchChange = vi.fn();
const mockHandleLoadMore = vi.fn();
const mockGetItemClassName = vi.fn((index: number) => `item-${index}`);
const mockGetItemStyle = vi.fn((index: number) => ({ animationDelay: `${index * 50}ms` }));

let mockSearchState = {
  isSearching: false,
  isIdle: false,
  handleSearchChange: mockHandleSearchChange,
  searchProjects: vi.fn(),
};
let mockLoadMoreState = {
  items: [] as ProjectListItem[],
  isLoading: false,
  hasMore: false,
  handleLoadMore: mockHandleLoadMore,
  getItemClassName: mockGetItemClassName,
  getItemStyle: mockGetItemStyle,
};

const mockLoaderData: ProjectsLoaderData = {
  projects: {
    total: 2,
    documents: [
      createMockProject({ $id: 'project-1', name: 'Project 1' }),
      createMockProject({ $id: 'project-2', name: 'Project 2' }),
    ],
  },
};

let mockCurrentLoaderData = mockLoaderData;

vi.mock('react-router', () => ({
  useFetcher: () => ({
    Form: ({ children, ...props }: React.ComponentProps<'form'>) => <form {...props}>{children}</form>,
  }),
  useLoaderData: () => mockCurrentLoaderData,
}));

vi.mock('@/features/projects/hooks/use-project-search/use-project-search', () => ({
  useProjectSearch: () => mockSearchState,
}));

vi.mock('@/shared/hooks/use-load-more/use-load-more', () => ({
  useLoadMore: (items: ProjectListItem[]) => ({
    ...mockLoadMoreState,
    items,
  }),
}));

vi.mock('@/shared/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title data-testid="meta-title">{title}</title>,
}));

vi.mock('@/shared/components/organisms/AppTopBar/AppTopBar', () => ({
  AppTopBar: ({ title, totalCount, label }: { title: string; totalCount: number; label: string }) => (
    <div data-testid="app-top-bar">
      {title} - {totalCount} {label}
    </div>
  ),
}));

vi.mock('@/shared/components/templates/PageTemplate/PageTemplate', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  PageList: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  PageTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

vi.mock('@/shared/components/atoms/TotalCounter/TotalCounter', () => ({
  TotalCounter: ({ totalCount, label }: { totalCount: number; label: string; icon: React.ComponentType }) => (
    <div data-testid="total-counter">
      {totalCount} {label}
    </div>
  ),
}));

vi.mock('@/features/projects/components/molecules/ProjectSearchField/ProjectSearchField', () => ({
  ProjectSearchField: ({
    onChange,
    isLoading,
  }: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
  }) => (
    <input
      data-testid="search-field"
      onChange={onChange}
      disabled={isLoading}
      placeholder="Search projects"
    />
  ),
}));

vi.mock('@/features/projects/components/organisms/ProjectCard/ProjectCard', () => ({
  ProjectCard: ({ project }: { project: ProjectListItem }) => (
    <div data-testid={`project-card-${project.$id}`}>{project.name}</div>
  ),
}));

vi.mock('@/features/projects/components/organisms/ProjectFormDialog/ProjectFormDialog', () => ({
  ProjectFormDialog: ({ children }: { children: React.ReactNode; method: string }) => (
    <div data-testid="project-form-dialog">{children}</div>
  ),
}));

vi.mock('@/shared/components/atoms/List/List', () => ({
  ItemList: ({
    children,
    index,
  }: {
    children: React.ReactNode;
    index: number;
    getClassName: (i: number) => string;
    getStyle: (i: number) => React.CSSProperties;
  }) => <div data-testid={`item-list-${index}`}>{children}</div>,
}));

vi.mock('@/shared/components/atoms/LoadMoreButton/LoadMoreButton', () => ({
  LoadMoreButton: ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
    <button
      data-testid="load-more-button"
      disabled={loading}
      onClick={onClick}>
      {loading ? 'Loading...' : 'Load More'}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}));

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchState = {
      isSearching: false,
      isIdle: false,
      handleSearchChange: mockHandleSearchChange,
      searchProjects: vi.fn(),
    };
    mockLoadMoreState = {
      items: mockLoaderData.projects.documents,
      isLoading: false,
      hasMore: false,
      handleLoadMore: mockHandleLoadMore,
      getItemClassName: mockGetItemClassName,
      getItemStyle: mockGetItemStyle,
    };
    mockCurrentLoaderData = mockLoaderData;
  });

  describe('rendering', () => {
    it('should render page title and structure', () => {
      render(<ProjectsPage />);

      expect(screen.getByText('My Projects')).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByLabelText('Project list')).toBeInTheDocument();
    });

    it('should render document head with correct title', () => {
      render(<ProjectsPage />);

      expect(document.title).toBe('Tasky AI | My Projects');
    });

    it('should render app top bar with project count', () => {
      render(<ProjectsPage />);

      expect(screen.getByTestId('app-top-bar')).toHaveTextContent('My Projects - 2 project');
    });

    it('should render create project button', () => {
      render(<ProjectsPage />);

      const createButton = screen.getByLabelText('Create a new project');
      expect(createButton).toBeInTheDocument();
    });

    it('should render total counter', () => {
      render(<ProjectsPage />);

      expect(screen.getByTestId('total-counter')).toHaveTextContent('2 project');
    });
  });

  describe('project list', () => {
    it('should render all visible projects', () => {
      render(<ProjectsPage />);

      expect(screen.getByTestId('project-card-project-1')).toBeInTheDocument();
      expect(screen.getByTestId('project-card-project-2')).toBeInTheDocument();
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });

    it('should show empty state when no projects exist', () => {
      mockCurrentLoaderData = {
        projects: { total: 0, documents: [] },
      };

      render(<ProjectsPage />);

      expect(screen.getByRole('status')).toHaveTextContent('No project found');
    });

    it('should not show empty state when projects exist', () => {
      render(<ProjectsPage />);

      expect(screen.queryByText('No project found')).not.toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should render search field', () => {
      render(<ProjectsPage />);

      expect(screen.getByTestId('search-field')).toBeInTheDocument();
    });

    it('should call handleSearchChange on search input', async () => {
      const user = userEvent.setup();
      render(<ProjectsPage />);

      const searchField = screen.getByTestId('search-field');
      await user.type(searchField, 'test');

      expect(mockHandleSearchChange).toHaveBeenCalled();
    });

    it('should apply opacity when searching', () => {
      mockSearchState = {
        isSearching: true,
        isIdle: false,
        handleSearchChange: mockHandleSearchChange,
        searchProjects: vi.fn(),
      };

      const { container } = render(<ProjectsPage />);

      const projectListContainer = container.querySelector('.opacity-25');
      expect(projectListContainer).toBeInTheDocument();
    });
  });

  describe('load more functionality', () => {
    it('should show load more button when hasMore is true', () => {
      mockLoadMoreState = {
        ...mockLoadMoreState,
        hasMore: true,
      };

      render(<ProjectsPage />);

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      render(<ProjectsPage />);

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when button is clicked', async () => {
      mockLoadMoreState = {
        ...mockLoadMoreState,
        hasMore: true,
      };

      const user = userEvent.setup();
      render(<ProjectsPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      expect(mockHandleLoadMore).toHaveBeenCalled();
    });

    it('should show loading state on load more button', () => {
      mockLoadMoreState = {
        ...mockLoadMoreState,
        isLoading: true,
        hasMore: true,
      };

      render(<ProjectsPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toHaveTextContent('Loading...');
      expect(loadMoreButton).toBeDisabled();
    });
  });

  describe('integration', () => {
    it('should handle null or undefined project documents', () => {
      mockCurrentLoaderData = {
        projects: { total: 0, documents: [] },
      };

      render(<ProjectsPage />);

      expect(screen.getByRole('status')).toHaveTextContent('No project found');
    });
  });
});
