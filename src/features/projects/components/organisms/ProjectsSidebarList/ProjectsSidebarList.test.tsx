import { createMockProject } from '@/core/test-setup/factories';
import { ProjectsSidebarList } from '@/features/projects/components/organisms/ProjectsSidebarList/ProjectsSidebarList';
import type { ProjectListItem } from '@/features/projects/types';
import type { ProjectsLoaderData } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

interface ProjectSidebarNavItemProps {
  project: ProjectListItem;
  handleMobileNavigation: () => void;
}

vi.mock('@/features/projects/components/molecules/ProjectSidebarNavItem/ProjectSidebarNavItem', () => ({
  ProjectSidebarNavItem: ({ project, handleMobileNavigation }: ProjectSidebarNavItemProps) => (
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

  interface RenderOptions {
    projectCount?: number;
    total?: number;
  }

  const renderComponent = ({ projectCount = 0, total }: RenderOptions = {}) => {
    const mockProjects: ProjectListItem[] = Array.from({ length: projectCount }, (_, i) =>
      createMockProject({ $id: `${i + 1}`, name: `Project ${i + 1}` })
    );

    mockUseLoaderData.mockReturnValue({
      projects: { documents: mockProjects, total: total ?? projectCount },
    } as ProjectsLoaderData);

    return render(<ProjectsSidebarList handleMobileNavigation={mockHandleMobileNavigation} />);
  };

  const getProjectItem = (id: string) => screen.queryByTestId(`project-item-${id}`);
  const getAllProjectsButton = () => screen.queryByTestId('all-projects-button');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render list of projects with correct structure', () => {
      renderComponent({ projectCount: 3 });

      expect(screen.getByTestId('collapsible-content')).toHaveAttribute('id', 'projects-list');
      expect(screen.getByTestId('sidebar-group-content')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
      expect(getProjectItem('1')).toHaveTextContent('Project 1');
      expect(getProjectItem('2')).toHaveTextContent('Project 2');
      expect(getProjectItem('3')).toHaveTextContent('Project 3');
    });

    it('should render projects with correct indices', () => {
      renderComponent({ projectCount: 2 });

      const navLists = screen.getAllByTestId('nav-list');
      expect(navLists[0]).toHaveAttribute('data-index', '0');
      expect(navLists[1]).toHaveAttribute('data-index', '1');
    });

    it('should limit display to 9 projects', () => {
      renderComponent({ projectCount: 12 });

      expect(getProjectItem('1')).toBeInTheDocument();
      expect(getProjectItem('9')).toBeInTheDocument();
      expect(getProjectItem('10')).not.toBeInTheDocument();
    });
  });

  describe('All Projects button', () => {
    it('should show when total exceeds 9 projects', () => {
      renderComponent({ projectCount: 10 });

      expect(getAllProjectsButton()).toBeInTheDocument();
    });

    it('should not show when total is 9 or fewer projects', () => {
      renderComponent({ projectCount: 9 });

      expect(getAllProjectsButton()).not.toBeInTheDocument();
    });

    it('should call handleMobileNavigation when clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ projectCount: 10 });

      await user.click(getAllProjectsButton()!);

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    it('should show empty message when no projects exist', () => {
      renderComponent({ projectCount: 0 });

      expect(screen.getByText('Click + to add some projects')).toBeInTheDocument();
    });

    it('should not show empty message when projects exist', () => {
      renderComponent({ projectCount: 1 });

      expect(screen.queryByText('Click + to add some projects')).not.toBeInTheDocument();
    });
  });

  describe('mobile navigation', () => {
    it('should call handleMobileNavigation when project item is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ projectCount: 1 });

      await user.click(getProjectItem('1')!);

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });
  });
});
