import { createMockProject } from '@/core/test-setup/factories';
import type { ProjectListItem } from '@/features/projects/types';
import { ProjectsPage } from '@/pages/ProjectsPage/ProjectsPage';
import type { ProjectsLoaderData } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHandleSearchChange = vi.fn();
const mockHandleLoadMore = vi.fn();
const mockGetItemClassName = vi.fn((index: number) => `item-${index}`);
const mockGetItemStyle = vi.fn((index: number) => ({ animationDelay: `${index * 50}ms` }));

interface MockState {
  isSearching?: boolean;
  hasMore?: boolean;
  isLoading?: boolean;
  projects?: ProjectListItem[];
}

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

let mockCurrentLoaderData: ProjectsLoaderData = {
  projects: {
    total: 2,
    documents: [
      createMockProject({ $id: 'project-1', name: 'Project 1' }),
      createMockProject({ $id: 'project-2', name: 'Project 2' }),
    ],
  },
};

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
  const defaultProjects = [
    createMockProject({ $id: 'project-1', name: 'Project 1' }),
    createMockProject({ $id: 'project-2', name: 'Project 2' }),
  ];

  const setupMocks = ({
    isSearching = false,
    hasMore = false,
    isLoading = false,
    projects = defaultProjects,
  }: MockState = {}) => {
    mockSearchState = {
      isSearching,
      isIdle: false,
      handleSearchChange: mockHandleSearchChange,
      searchProjects: vi.fn(),
    };

    mockLoadMoreState = {
      items: projects,
      isLoading,
      hasMore,
      handleLoadMore: mockHandleLoadMore,
      getItemClassName: mockGetItemClassName,
      getItemStyle: mockGetItemStyle,
    };

    mockCurrentLoaderData = {
      projects: {
        total: projects.length,
        documents: projects,
      },
    };
  };

  const renderProjectsPage = (mockState: MockState = {}) => {
    setupMocks(mockState);
    return render(<ProjectsPage />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title and structure', () => {
      renderProjectsPage();

      expect(screen.getByText('My Projects')).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByLabelText('Project list')).toBeInTheDocument();
    });

    it('should set document title to "Tasky AI | My Projects"', () => {
      renderProjectsPage();

      expect(document.title).toBe('Tasky AI | My Projects');
    });

    it('should render app top bar with project count', () => {
      renderProjectsPage();

      expect(screen.getByTestId('app-top-bar')).toHaveTextContent('My Projects - 2 project');
    });

    it('should render create project button with aria-label', () => {
      renderProjectsPage();

      expect(screen.getByLabelText('Create a new project')).toBeInTheDocument();
    });

    it('should render total counter with project count', () => {
      renderProjectsPage();

      expect(screen.getByTestId('total-counter')).toHaveTextContent('2 project');
    });
  });

  describe('project list', () => {
    it('should render all project cards with correct content', () => {
      renderProjectsPage();

      expect(screen.getByTestId('project-card-project-1')).toHaveTextContent('Project 1');
      expect(screen.getByTestId('project-card-project-2')).toHaveTextContent('Project 2');
    });

    it('should show empty state when no projects exist', () => {
      renderProjectsPage({ projects: [] });

      expect(screen.getByRole('status')).toHaveTextContent('No project found');
    });

    it('should not show empty state when projects exist', () => {
      renderProjectsPage();

      expect(screen.queryByText('No project found')).not.toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('should render search field', () => {
      renderProjectsPage();

      expect(screen.getByTestId('search-field')).toBeInTheDocument();
    });

    it('should call handleSearchChange when typing in search field', async () => {
      const user = userEvent.setup();
      renderProjectsPage();

      await user.type(screen.getByTestId('search-field'), 'test');

      expect(mockHandleSearchChange).toHaveBeenCalled();
    });

    it('should apply opacity to project list when searching', () => {
      const { container } = renderProjectsPage({ isSearching: true });

      expect(container.querySelector('.opacity-25')).toBeInTheDocument();
    });
  });

  describe('load more', () => {
    it('should show load more button when hasMore is true', () => {
      renderProjectsPage({ hasMore: true });

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      renderProjectsPage();

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when load more button is clicked', async () => {
      const user = userEvent.setup();
      renderProjectsPage({ hasMore: true });

      await user.click(screen.getByTestId('load-more-button'));

      expect(mockHandleLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should disable load more button and show loading text when loading', () => {
      renderProjectsPage({ hasMore: true, isLoading: true });

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toHaveTextContent('Loading...');
      expect(loadMoreButton).toBeDisabled();
    });
  });
});
