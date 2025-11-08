import type { ProjectsLoaderData } from '@/types/loaders.types';
import type { ProjectEntity } from '@/types/projects.types';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsPage } from './ProjectsPage';
import { useLoaderData } from 'react-router';
import { PropsWithChildren } from 'react';

vi.mock('react-router', () => ({
  useLoaderData: vi.fn(),
}));

vi.mock('@/components/atoms/Head/Head', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

vi.mock('@/components/atoms/Page/Page', () => ({
  PageContainer: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  PageList: ({ children, ...props }: { children: React.ReactNode }) => <ul {...props}>{children}</ul>,
  PageTitle: ({ children }: { children: React.ReactNode }) => <h1 id="projects-page-title">{children}</h1>,
}));

vi.mock('@/components/atoms/List/List', () => ({
  ItemList: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}));

vi.mock('@/components/atoms/TotalCounter/TotalCounter', () => ({
  TotalCounter: ({ totalCount, label }: { totalCount: number; label: string }) => (
    <span data-testid="total-counter">
      {totalCount} {label}
    </span>
  ),
}));

vi.mock('@/components/organisms/TopAppBar', () => ({
  TopAppBar: ({ title, totalCount, label }: { title: string; totalCount: number; label: string }) => (
    <div data-testid="top-app-bar">
      <span>{title}</span>
      <span data-testid="top-app-bar-count">{totalCount}</span>
      <span>{label}</span>
    </div>
  ),
}));

vi.mock('@/components/organisms/ProjectFormDialog', () => ({
  ProjectFormDialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="project-form-dialog">{children}</div>
  ),
}));

vi.mock('@/components/molecules/ProjectSearchField/ProjectSearchField', () => ({
  ProjectSearchField: ({ onChange, searchStatus }: { onChange: () => void; searchStatus: string }) => (
    <input
      data-testid="search-field"
      data-search-status={searchStatus}
      onChange={onChange}
      placeholder="Search projects"
    />
  ),
}));

vi.mock('@/components/organisms/ProjectCard', () => ({
  ProjectCard: ({ project }: { project: ProjectEntity }) => (
    <div data-testid={`project-card-${project.$id}`}>{project.name}</div>
  ),
}));

vi.mock('@/components/atoms/LoadMoreButton/LoadMoreButton', () => ({
  LoadMoreButton: ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
    <button
      data-testid="load-more-button"
      onClick={onClick}
      disabled={loading}>
      {loading ? 'Loading...' : 'Load More'}
    </button>
  ),
}));

const mockUseProjectOperations = vi.fn();
vi.mock('@/hooks/use-project-operations', () => ({
  useProjectOperations: () => mockUseProjectOperations(),
}));

const mockUseLoadMore = vi.fn();
vi.mock('@/hooks/use-load-more', () => ({
  useLoadMore: (projects: ProjectEntity[]) => mockUseLoadMore(projects),
}));

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('ProjectsPage', () => {
  const MOCK_PROJECT_ID_1 = 'project-1';
  const MOCK_PROJECT_ID_2 = 'project-2';
  const MOCK_PROJECT_ID_3 = 'project-3';

  const createMockProject = (overrides?: Partial<ProjectEntity>): ProjectEntity => ({
    $id: MOCK_PROJECT_ID_1,
    userId: 'user-1',
    name: 'Test Project',
    color_name: 'blue',
    color_hex: '#0000FF',
    tasks: [],
    $createdAt: '2024-01-01',
    $updatedAt: '2024-01-01',
    $collectionId: 'projects',
    $databaseId: 'db',
    $permissions: [],
    ...overrides,
  });

  const createMockLoaderData = (projects: ProjectEntity[] = [createMockProject()]): ProjectsLoaderData => ({
    projects: {
      documents: projects,
      total: projects.length,
    },
  });

  const mockFetcher = {
    Form: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => <form {...props}>{children}</form>,
  };

  const setupDefaultMocks = (projects: ProjectEntity[] = [createMockProject()]) => {
    mockUseProjectOperations.mockReturnValue({
      fetcher: mockFetcher,
      searchStatus: 'idle',
      handleSearchProjects: vi.fn(),
    });

    mockUseLoadMore.mockReturnValue({
      items: projects,
      isLoading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      getItemClassName: () => '',
      getItemStyle: () => ({}),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render page title and structure', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<ProjectsPage />);

      expect(screen.getByRole('heading', { name: 'My Projects' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Project list' })).toBeInTheDocument();
    });

    it('should set document title', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<ProjectsPage />);

      expect(document.title).toBe('Tasky AI | My Projects');
    });

    it('should render top app bar with correct props', () => {
      const projects = [
        createMockProject({ $id: MOCK_PROJECT_ID_1, name: 'Project 1' }),
        createMockProject({ $id: MOCK_PROJECT_ID_2, name: 'Project 2' }),
      ];
      const mockData = createMockLoaderData(projects);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(projects);

      render(<ProjectsPage />);

      const topAppBar = screen.getByTestId('top-app-bar');
      expect(topAppBar).toHaveTextContent('My Projects');
      expect(screen.getByTestId('top-app-bar-count')).toHaveTextContent('2');
    });

    it('should render create project button', () => {
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectsPage />);

      const createButton = screen.getByRole('button', { name: /create a new project/i });
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('project rendering', () => {
    it('should render all projects', () => {
      const projects = [
        createMockProject({ $id: MOCK_PROJECT_ID_1, name: 'Project 1' }),
        createMockProject({ $id: MOCK_PROJECT_ID_2, name: 'Project 2' }),
        createMockProject({ $id: MOCK_PROJECT_ID_3, name: 'Project 3' }),
      ];
      const mockData = createMockLoaderData(projects);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(projects);

      render(<ProjectsPage />);

      expect(screen.getByTestId(`project-card-${MOCK_PROJECT_ID_1}`)).toHaveTextContent('Project 1');
      expect(screen.getByTestId(`project-card-${MOCK_PROJECT_ID_2}`)).toHaveTextContent('Project 2');
      expect(screen.getByTestId(`project-card-${MOCK_PROJECT_ID_3}`)).toHaveTextContent('Project 3');
    });

    it('should show total counter when projects exist', () => {
      const mockData = createMockLoaderData([createMockProject()]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([createMockProject()]);

      render(<ProjectsPage />);

      expect(screen.getByTestId('total-counter')).toHaveTextContent('1 project');
    });

    it('should display "No project found" when no projects exist', () => {
      const mockData = createMockLoaderData([]);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks([]);

      render(<ProjectsPage />);

      expect(screen.getByRole('status')).toHaveTextContent('No project found');
    });

    it('should pass projectDocs to useLoadMore hook', () => {
      const projects = [createMockProject({ $id: MOCK_PROJECT_ID_1 }), createMockProject({ $id: MOCK_PROJECT_ID_2 })];
      const mockData = createMockLoaderData(projects);
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks(projects);

      render(<ProjectsPage />);

      expect(mockUseLoadMore).toHaveBeenCalledWith(projects);
    });
  });

  describe('search functionality', () => {
    it('should render search field', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<ProjectsPage />);

      expect(screen.getByTestId('search-field')).toBeInTheDocument();
    });

    it('should render search form with correct attributes', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<ProjectsPage />);

      const searchForm = screen.getByRole('search');
      expect(searchForm).toBeInTheDocument();
      expect(searchForm).toHaveAttribute('method', 'get');
    });

    it('should call handleSearchProjects when search input changes', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData();
      const mockHandleSearchProjects = vi.fn();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectOperations.mockReturnValue({
        fetcher: mockFetcher,
        searchStatus: 'idle',
        handleSearchProjects: mockHandleSearchProjects,
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockProject()],
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectsPage />);

      const searchField = screen.getByTestId('search-field');
      await user.type(searchField, 'test');

      await waitFor(() => {
        expect(mockHandleSearchProjects).toHaveBeenCalled();
      });
    });

    it('should pass searchStatus to ProjectSearchField', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectOperations.mockReturnValue({
        fetcher: mockFetcher,
        searchStatus: 'searching',
        handleSearchProjects: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockProject()],
        isLoading: false,
        hasMore: false,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectsPage />);

      const searchField = screen.getByTestId('search-field');
      expect(searchField).toHaveAttribute('data-search-status', 'searching');
    });
  });

  describe('load more functionality', () => {
    it('should show load more button when hasMore is true', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectOperations.mockReturnValue({
        fetcher: mockFetcher,
        searchStatus: 'idle',
        handleSearchProjects: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockProject()],
        isLoading: false,
        hasMore: true,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectsPage />);

      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<ProjectsPage />);

      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('should call handleLoadMore when button is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockLoaderData();
      const mockHandleLoadMore = vi.fn();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectOperations.mockReturnValue({
        fetcher: mockFetcher,
        searchStatus: 'idle',
        handleSearchProjects: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockProject()],
        isLoading: false,
        hasMore: true,
        handleLoadMore: mockHandleLoadMore,
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectsPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      expect(mockHandleLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should disable load more button when loading', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);

      mockUseProjectOperations.mockReturnValue({
        fetcher: mockFetcher,
        searchStatus: 'idle',
        handleSearchProjects: vi.fn(),
      });

      mockUseLoadMore.mockReturnValue({
        items: [createMockProject()],
        isLoading: true,
        hasMore: true,
        handleLoadMore: vi.fn(),
        getItemClassName: () => '',
        getItemStyle: () => ({}),
      });

      render(<ProjectsPage />);

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
      expect(loadMoreButton).toHaveTextContent('Loading...');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockData = createMockLoaderData();
      mockedUseLoaderData.mockReturnValue(mockData);
      setupDefaultMocks();

      render(<ProjectsPage />);

      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Project list' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create a new project/i })).toBeInTheDocument();
    });
  });
});
