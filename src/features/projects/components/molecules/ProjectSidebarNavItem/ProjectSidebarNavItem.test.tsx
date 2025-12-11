import { createMockProjectListItem } from '@/core/test-setup/factories';
import { ProjectSidebarNavItem } from '@/features/projects/components/molecules/ProjectSidebarNavItem/ProjectSidebarNavItem';
import type { ProjectListItem } from '@/features/projects/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface ProjectSidebarNavLinkProps {
  id: string;
  colorHex: string;
  name: string;
  onClick: () => void;
}
interface RenderOptions {
  project?: ProjectListItem;
}
interface ProjectActionMenuProps {
  children: React.ReactNode;
  defaultValues: {
    id: string;
    name: string;
    color_name: string;
    color_hex: string;
  };
  side?: string;
  align?: string;
}
interface SidebarMenuActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  showOnHover?: boolean;
}

vi.mock('@/features/projects/components/molecules/ProjectSidebarNavLink/ProjectSidebarNavLink', () => ({
  ProjectSidebarNavLink: ({ id, colorHex, name, onClick }: ProjectSidebarNavLinkProps) => (
    <a
      href={`/project/${id}`}
      data-testid="project-nav-link"
      data-color={colorHex}
      onClick={onClick}>
      {name}
    </a>
  ),
}));

vi.mock('@/features/projects/components/organisms/ProjectActionMenu/ProjectActionMenu', () => ({
  ProjectActionMenu: ({ children, defaultValues }: ProjectActionMenuProps) => (
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

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuAction: ({ children, onClick, showOnHover, ...props }: SidebarMenuActionProps) => (
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

  const mockProject: ProjectListItem = createMockProjectListItem({
    $id: '1',
    name: 'Test Project',
    color_hex: '#FF0000',
    color_name: 'red',
  });

  const renderComponent = ({ project = mockProject }: RenderOptions = {}) => {
    return render(
      <ProjectSidebarNavItem
        project={project}
        handleMobileNavigation={mockHandleMobileNavigation}
      />
    );
  };

  const getNavLink = () => screen.getByTestId('project-nav-link');
  const getActionMenu = () => screen.getByTestId('project-action-menu');
  const getActionButton = () => screen.getByLabelText(/more actions for project/i);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render project navigation link with correct name and attributes', () => {
      renderComponent();

      const navLink = getNavLink();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(navLink).toHaveAttribute('href', '/project/1');
      expect(navLink).toHaveAttribute('data-color', '#FF0000');
    });

    it('should render action menu with correct project data', () => {
      renderComponent();

      const actionMenu = getActionMenu();
      expect(actionMenu).toBeInTheDocument();
      expect(actionMenu).toHaveAttribute('data-project-id', '1');
      expect(actionMenu).toHaveAttribute('data-project-name', 'Test Project');
      expect(actionMenu).toHaveAttribute('data-color-name', 'red');
      expect(actionMenu).toHaveAttribute('data-color-hex', '#FF0000');
    });

    it('should render action button with descriptive aria-label and showOnHover', () => {
      renderComponent();

      const button = getActionButton();
      expect(button).toHaveAttribute('aria-label', 'More actions for project Test Project');
      expect(button).toHaveAttribute('data-show-on-hover', 'true');
    });
  });

  describe('user interactions', () => {
    it('should call handleMobileNavigation when nav link is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getNavLink());

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });

    it('should not call handleMobileNavigation when action button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getActionButton());

      expect(mockHandleMobileNavigation).not.toHaveBeenCalled();
    });
  });

  describe('different project data', () => {
    it('should render with different project values', () => {
      const differentProject = createMockProjectListItem({
        $id: '2',
        name: 'Another Project',
        color_hex: '#00FF00',
        color_name: 'green',
      });

      renderComponent({ project: differentProject });

      expect(screen.getByText('Another Project')).toBeInTheDocument();
      expect(getNavLink()).toHaveAttribute('data-color', '#00FF00');
      expect(getActionMenu()).toHaveAttribute('data-project-id', '2');
      expect(getActionMenu()).toHaveAttribute('data-color-hex', '#00FF00');
      expect(getActionMenu()).toHaveAttribute('data-color-name', 'green');
    });

    it('should handle special characters in project name', () => {
      const specialProject = createMockProjectListItem({
        name: 'Project #1 & More!',
      });

      renderComponent({ project: specialProject });

      expect(screen.getByText('Project #1 & More!')).toBeInTheDocument();
      expect(screen.getByLabelText('More actions for project Project #1 & More!')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should hide decorative icon from screen readers', () => {
      const { container } = renderComponent();

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });
});
