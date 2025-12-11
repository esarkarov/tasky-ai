import { ProjectsSidebarSection } from '@/features/projects/components/organisms/ProjectsSidebarSection/ProjectsSidebarSection';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/projects/components/atoms/AddProjectButton/AddProjectButton', () => ({
  AddProjectButton: () => <button data-testid="add-project-button">Add Project</button>,
}));

vi.mock('@/features/projects/components/molecules/ProjectsSidebarLabel/ProjectsSidebarLabel', () => ({
  ProjectsSidebarLabel: () => <div data-testid="projects-sidebar-label">Projects</div>,
}));

interface ProjectsSidebarListProps {
  handleMobileNavigation: () => void;
}

vi.mock('@/features/projects/components/organisms/ProjectsSidebarList/ProjectsSidebarList', () => ({
  ProjectsSidebarList: ({ handleMobileNavigation }: ProjectsSidebarListProps) => (
    <div data-testid="projects-sidebar-list">
      <button onClick={handleMobileNavigation}>Project Item</button>
    </div>
  ),
}));

interface CollapsibleProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

vi.mock('@/shared/components/ui/collapsible', () => ({
  Collapsible: ({ children, defaultOpen, className }: CollapsibleProps) => (
    <div
      data-testid="collapsible"
      data-default-open={defaultOpen}
      className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-group">{children}</div>,
}));

describe('ProjectsSidebarSection', () => {
  const mockHandleMobileNavigation = vi.fn();

  const renderComponent = () => {
    return render(<ProjectsSidebarSection handleMobileNavigation={mockHandleMobileNavigation} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all components with correct structure and order', () => {
      renderComponent();

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible).toHaveAttribute('data-default-open', 'true');
      expect(collapsible).toHaveClass('group/collapsible');

      const sidebarGroup = screen.getByTestId('sidebar-group');
      expect(sidebarGroup).toBeInTheDocument();

      const children = Array.from(sidebarGroup.children);
      expect(children[0]).toHaveAttribute('data-testid', 'projects-sidebar-label');
      expect(children[1]).toHaveAttribute('data-testid', 'add-project-button');
      expect(children[2]).toHaveAttribute('data-testid', 'projects-sidebar-list');
    });
  });

  describe('prop passing', () => {
    it('should pass handleMobileNavigation to ProjectsSidebarList', () => {
      renderComponent();

      const projectItem = screen.getByRole('button', { name: /project item/i });
      projectItem.click();

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });
  });
});
