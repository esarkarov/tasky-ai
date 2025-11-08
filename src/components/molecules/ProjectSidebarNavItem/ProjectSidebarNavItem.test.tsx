import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectSidebarNavItem } from './ProjectSidebarNavItem';
import { ProjectListItem } from '@/types/projects.types';

vi.mock('@/components/molecules/ProjectSidebarNavLink/ProjectSidebarNavLink', () => ({
  ProjectSidebarNavLink: ({
    id,
    colorHex,
    name,
    onClick,
  }: {
    id: string;
    colorHex: string;
    name: string;
    onClick: () => void;
  }) => (
    <a
      href={`/project/${id}`}
      data-testid="project-nav-link"
      data-color={colorHex}
      onClick={onClick}>
      {name}
    </a>
  ),
}));

vi.mock('@/components/organisms/ProjectActionMenu', () => ({
  ProjectActionMenu: ({
    children,
    defaultValues,
  }: {
    children: React.ReactNode;
    defaultValues: { id: string; name: string; color_name: string; color_hex: string };
    side?: string;
    align?: string;
  }) => (
    <div
      data-testid="project-action-menu"
      data-project-id={defaultValues.id}
      data-project-name={defaultValues.name}
      data-color-name={defaultValues.color_name}
      data-color-hex={defaultValues.color_hex}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuAction: ({
    children,
    onClick,
    showOnHover,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    showOnHover?: boolean;
  }) => (
    <button
      onClick={onClick}
      data-show-on-hover={showOnHover}
      {...props}>
      {children}
    </button>
  ),
}));

describe('ProjectSidebarNavItem', () => {
  const mockHandleMobileNavigation = vi.fn();

  const mockProject: ProjectListItem = {
    $id: '1',
    name: 'Test Project',
    color_hex: '#FF0000',
    color_name: 'red',
    $createdAt: '2024-01-01',
    $collectionId: 'col1',
    $databaseId: 'db1',
    $permissions: [],
    $updatedAt: '2024-01-01',
  };

  const defaultProps = {
    project: mockProject,
    handleMobileNavigation: mockHandleMobileNavigation,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render project navigation link with name', () => {
      render(<ProjectSidebarNavItem {...defaultProps} />);

      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should render project action menu', () => {
      render(<ProjectSidebarNavItem {...defaultProps} />);

      expect(screen.getByTestId('project-action-menu')).toBeInTheDocument();
    });

    it('should render more actions button with aria-label', () => {
      render(<ProjectSidebarNavItem {...defaultProps} />);

      expect(screen.getByLabelText('More actions for project Test Project')).toBeInTheDocument();
    });

    it('should hide MoreHorizontal icon from screen readers', () => {
      const { container } = render(<ProjectSidebarNavItem {...defaultProps} />);

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('ProjectSidebarNavLink props', () => {
    it('should pass correct props to ProjectSidebarNavLink', () => {
      render(<ProjectSidebarNavItem {...defaultProps} />);

      const navLink = screen.getByTestId('project-nav-link');
      expect(navLink).toHaveAttribute('href', '/project/1');
      expect(navLink).toHaveAttribute('data-color', '#FF0000');
      expect(navLink).toHaveTextContent('Test Project');
    });

    it('should pass handleMobileNavigation to onClick', async () => {
      const user = userEvent.setup();
      render(<ProjectSidebarNavItem {...defaultProps} />);

      const navLink = screen.getByTestId('project-nav-link');
      await user.click(navLink);

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProjectActionMenu props', () => {
    it('should pass correct defaultValues to ProjectActionMenu', () => {
      render(<ProjectSidebarNavItem {...defaultProps} />);

      const actionMenu = screen.getByTestId('project-action-menu');
      expect(actionMenu).toHaveAttribute('data-project-id', '1');
      expect(actionMenu).toHaveAttribute('data-project-name', 'Test Project');
      expect(actionMenu).toHaveAttribute('data-color-name', 'red');
      expect(actionMenu).toHaveAttribute('data-color-hex', '#FF0000');
    });
  });

  describe('user interactions', () => {
    it('should call handleMobileNavigation when nav link is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectSidebarNavItem {...defaultProps} />);

      const navLink = screen.getByTestId('project-nav-link');
      await user.click(navLink);

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });

    it('should not call handleMobileNavigation when action button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectSidebarNavItem {...defaultProps} />);

      const actionButton = screen.getByLabelText('More actions for project Test Project');
      await user.click(actionButton);

      expect(mockHandleMobileNavigation).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive aria-label on action button', () => {
      render(<ProjectSidebarNavItem {...defaultProps} />);

      const button = screen.getByLabelText('More actions for project Test Project');
      expect(button).toHaveAttribute('aria-label', 'More actions for project Test Project');
    });

    it('should have showOnHover prop on action button', () => {
      render(<ProjectSidebarNavItem {...defaultProps} />);

      const button = screen.getByLabelText('More actions for project Test Project');
      expect(button).toHaveAttribute('data-show-on-hover', 'true');
    });
  });

  describe('different project data', () => {
    it('should render with different project values', () => {
      const differentProject: ProjectListItem = {
        ...mockProject,
        $id: '2',
        name: 'Another Project',
        color_hex: '#00FF00',
        color_name: 'green',
      };

      render(
        <ProjectSidebarNavItem
          {...defaultProps}
          project={differentProject}
        />
      );

      expect(screen.getByText('Another Project')).toBeInTheDocument();

      const navLink = screen.getByTestId('project-nav-link');
      expect(navLink).toHaveAttribute('data-color', '#00FF00');

      const actionMenu = screen.getByTestId('project-action-menu');
      expect(actionMenu).toHaveAttribute('data-project-id', '2');
      expect(actionMenu).toHaveAttribute('data-color-hex', '#00FF00');
      expect(actionMenu).toHaveAttribute('data-color-name', 'green');
    });

    it('should handle special characters in project name', () => {
      const specialProject: ProjectListItem = {
        ...mockProject,
        name: 'Project #1 & More!',
      };

      render(
        <ProjectSidebarNavItem
          {...defaultProps}
          project={specialProject}
        />
      );

      expect(screen.getByText('Project #1 & More!')).toBeInTheDocument();
      expect(screen.getByLabelText('More actions for project Project #1 & More!')).toBeInTheDocument();
    });
  });
});
