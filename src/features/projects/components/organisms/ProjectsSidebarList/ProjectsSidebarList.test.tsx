import { createMockProject } from '@/core/tests/factories';
import type { ProjectListItem } from '@/features/projects/types';
import type { ProjectsLoaderData } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsSidebarList } from './ProjectsSidebarList';

const mockUseLoaderData = vi.fn();
vi.mock('react-router', () => ({
  useLoaderData: () => mockUseLoaderData(),
}));

vi.mock('@/features/projects/components/atoms/AllProjectsButton/AllProjectsButton', () => ({
  AllProjectsButton: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      data-testid="all-projects-button">
      All Projects
    </button>
  ),
}));

vi.mock('@/features/projects/components/molecules/ProjectSidebarNavItem/ProjectSidebarNavItem', () => ({
  ProjectSidebarNavItem: ({
    project,
    handleMobileNavigation,
  }: {
    project: ProjectListItem;
    handleMobileNavigation: () => void;
  }) => (
    <button
      onClick={handleMobileNavigation}
      data-testid={`project-item-${project.$id}`}>
      {project.name}
    </button>
  ),
}));

vi.mock('@/shared/components/atoms/List/List', () => ({
  NavList: ({ children, index }: { children: React.ReactNode; index: number }) => (
    <li
      data-testid="nav-list"
      data-index={index}>
      {children}
    </li>
  ),
}));

vi.mock('@/shared/components/ui/collapsible', () => ({
  CollapsibleContent: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <div
      data-testid="collapsible-content"
      id={id}>
      {children}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul data-testid="sidebar-menu">{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li data-testid="sidebar-menu-item">{children}</li>,
}));

describe('ProjectsSidebarList', () => {
  const mockHandleMobileNavigation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders list of projects', () => {
      const mockProjects: ProjectListItem[] = [
        createMockProject({ $id: '1', name: 'Project 1' }),
        createMockProject({ $id: '2', name: 'Project 2' }),
        createMockProject({ $id: '3', name: 'Project 3' }),
      ];

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 3 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.getByTestId('project-item-1')).toHaveTextContent('Project 1');
      expect(screen.getByTestId('project-item-2')).toHaveTextContent('Project 2');
      expect(screen.getByTestId('project-item-3')).toHaveTextContent('Project 3');
    });

    it('limits display to 9 projects', () => {
      const mockProjects: ProjectListItem[] = Array.from({ length: 12 }, (_, i) =>
        createMockProject({ $id: `${i + 1}`, name: `Project ${i + 1}` })
      );

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 12 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.getByTestId('project-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('project-item-9')).toBeInTheDocument();
      expect(screen.queryByTestId('project-item-10')).not.toBeInTheDocument();
    });

    it('renders each project with correct index', () => {
      const mockProjects: ProjectListItem[] = [
        createMockProject({ $id: '1', name: 'Project 1' }),
        createMockProject({ $id: '2', name: 'Project 2' }),
      ];

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 2 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      const navLists = screen.getAllByTestId('nav-list');
      expect(navLists[0]).toHaveAttribute('data-index', '0');
      expect(navLists[1]).toHaveAttribute('data-index', '1');
    });
  });

  describe('All Projects button', () => {
    it('shows All Projects button when total exceeds limit', () => {
      const mockProjects: ProjectListItem[] = Array.from({ length: 10 }, (_, i) =>
        createMockProject({ $id: `${i + 1}`, name: `Project ${i + 1}` })
      );

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 10 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.getByTestId('all-projects-button')).toBeInTheDocument();
    });

    it('does not show All Projects button when total is at limit', () => {
      const mockProjects: ProjectListItem[] = Array.from({ length: 9 }, (_, i) =>
        createMockProject({ $id: `${i + 1}`, name: `Project ${i + 1}` })
      );

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 9 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.queryByTestId('all-projects-button')).not.toBeInTheDocument();
    });

    it('does not show All Projects button when total is below limit', () => {
      const mockProjects: ProjectListItem[] = [createMockProject({ $id: '1', name: 'Project 1' })];

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 1 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.queryByTestId('all-projects-button')).not.toBeInTheDocument();
    });

    it('calls handleMobileNavigation when All Projects button is clicked', async () => {
      const user = userEvent.setup();
      const mockProjects: ProjectListItem[] = Array.from({ length: 10 }, (_, i) =>
        createMockProject({ $id: `${i + 1}`, name: `Project ${i + 1}` })
      );

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 10 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      await user.click(screen.getByTestId('all-projects-button'));

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    it('shows empty message when no projects exist', () => {
      mockUseLoaderData.mockReturnValue({
        projects: { documents: [], total: 0 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.getByText('Click + to add some projects')).toBeInTheDocument();
    });

    it('does not show empty message when projects exist', () => {
      const mockProjects: ProjectListItem[] = [createMockProject({ $id: '1', name: 'Project 1' })];

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 1 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.queryByText('Click + to add some projects')).not.toBeInTheDocument();
    });
  });

  describe('mobile navigation', () => {
    it('calls handleMobileNavigation when project item is clicked', async () => {
      const user = userEvent.setup();
      const mockProjects: ProjectListItem[] = [createMockProject({ $id: '1', name: 'Project 1' })];

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 1 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      await user.click(screen.getByTestId('project-item-1'));

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });

    it('passes handleMobileNavigation to each project item', () => {
      const mockProjects: ProjectListItem[] = [
        createMockProject({ $id: '1', name: 'Project 1' }),
        createMockProject({ $id: '2', name: 'Project 2' }),
      ];

      mockUseLoaderData.mockReturnValue({
        projects: { documents: mockProjects, total: 2 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.getByTestId('project-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('project-item-2')).toBeInTheDocument();
    });
  });

  describe('structure', () => {
    it('renders within CollapsibleContent with correct id', () => {
      mockUseLoaderData.mockReturnValue({
        projects: { documents: [], total: 0 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      const collapsibleContent = screen.getByTestId('collapsible-content');
      expect(collapsibleContent).toHaveAttribute('id', 'projects-list');
    });

    it('renders with correct component hierarchy', () => {
      mockUseLoaderData.mockReturnValue({
        projects: { documents: [], total: 0 },
      } as ProjectsLoaderData);

      render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);

      expect(screen.getByTestId('collapsible-content')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-group-content')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
    });
  });
});
