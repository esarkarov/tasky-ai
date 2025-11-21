import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectsSidebarSection } from './ProjectsSidebarSection';

vi.mock('@/features/projects/components/atoms/AddProjectButton/AddProjectButton', () => ({
  AddProjectButton: () => <button data-testid="add-project-button">Add Project</button>,
}));

vi.mock('@/features/projects/components/molecules/ProjectsSidebarLabel/ProjectsSidebarLabel', () => ({
  ProjectsSidebarLabel: () => <div data-testid="projects-sidebar-label">Projects</div>,
}));

vi.mock('@/features/projects/components/organisms/ProjectsSidebarList/ProjectsSidebarList', () => ({
  ProjectsSidebarList: ({ handleMobileNavigation }: { handleMobileNavigation: () => void }) => (
    <div data-testid="projects-sidebar-list">
      <button onClick={handleMobileNavigation}>Project Item</button>
    </div>
  ),
}));

vi.mock('@/shared/components/ui/collapsible', () => ({
  Collapsible: ({
    children,
    defaultOpen,
    className,
  }: {
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
  }) => (
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

  it('renders all child components', () => {
    render(<ProjectsSidebarSection handleMobileNavigation={mockHandleMobileNavigation} />);

    expect(screen.getByTestId('projects-sidebar-label')).toBeInTheDocument();
    expect(screen.getByTestId('add-project-button')).toBeInTheDocument();
    expect(screen.getByTestId('projects-sidebar-list')).toBeInTheDocument();
  });

  it('wraps content in Collapsible component with defaultOpen', () => {
    render(<ProjectsSidebarSection handleMobileNavigation={mockHandleMobileNavigation} />);

    const collapsible = screen.getByTestId('collapsible');

    expect(collapsible).toBeInTheDocument();
    expect(collapsible).toHaveAttribute('data-default-open', 'true');
    expect(collapsible).toHaveClass('group/collapsible');
  });

  it('wraps content in SidebarGroup', () => {
    render(<ProjectsSidebarSection handleMobileNavigation={mockHandleMobileNavigation} />);

    expect(screen.getByTestId('sidebar-group')).toBeInTheDocument();
  });

  it('passes handleMobileNavigation prop to ProjectsSidebarList', () => {
    render(<ProjectsSidebarSection handleMobileNavigation={mockHandleMobileNavigation} />);

    const projectItem = screen.getByRole('button', { name: /project item/i });
    projectItem.click();

    expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
  });

  it('renders components in correct order', () => {
    render(<ProjectsSidebarSection handleMobileNavigation={mockHandleMobileNavigation} />);

    const sidebarGroup = screen.getByTestId('sidebar-group');
    const children = Array.from(sidebarGroup.children);

    expect(children[0]).toHaveAttribute('data-testid', 'projects-sidebar-label');
    expect(children[1]).toHaveAttribute('data-testid', 'add-project-button');
    expect(children[2]).toHaveAttribute('data-testid', 'projects-sidebar-list');
  });
});
