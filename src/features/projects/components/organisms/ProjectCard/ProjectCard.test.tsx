import type { ProjectListItem } from '@/features/projects/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectCard } from './ProjectCard';

const createMockProject = (overrides?: Partial<ProjectListItem>): ProjectListItem => ({
  $id: 'project-123',
  name: 'Test Project',
  color_name: 'blue',
  color_hex: '#0000FF',
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $collectionId: 'projects',
  $databaseId: 'db',
  $permissions: [],
  ...overrides,
});

vi.mock('@/features/projects/components/organisms/ProjectActionMenu/ProjectActionMenu', () => ({
  ProjectActionMenu: ({
    children,
    defaultValues,
  }: {
    children: React.ReactNode;
    defaultValues: Record<string, string>;
  }) => (
    <div
      data-testid="project-action-menu"
      data-project-id={defaultValues.id}>
      {children}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('ProjectCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render project name', () => {
      const project = createMockProject({ name: 'My Awesome Project' });
      renderWithRouter(<ProjectCard project={project} />);

      expect(screen.getByText('My Awesome Project')).toBeInTheDocument();
    });

    it('should render project with correct aria-label', () => {
      const project = createMockProject({ name: 'Test Project' });
      renderWithRouter(<ProjectCard project={project} />);

      expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Project: Test Project');
    });

    it('should render hash icon with project color', () => {
      const project = createMockProject({ color_hex: '#FF0000' });
      const { container } = renderWithRouter(<ProjectCard project={project} />);

      const hashIcon = container.querySelector('svg');
      expect(hashIcon).toHaveStyle({ color: project.color_hex });
    });

    it('should render more actions button', () => {
      const project = createMockProject({ name: 'Test Project' });
      renderWithRouter(<ProjectCard project={project} />);

      const actionsButton = screen.getByLabelText('More actions for project Test Project');
      expect(actionsButton).toBeInTheDocument();
    });

    it('should render project action menu with correct default values', () => {
      const project = createMockProject({
        $id: 'project-456',
        name: 'Demo Project',
        color_name: 'red',
        color_hex: '#FF0000',
      });
      renderWithRouter(<ProjectCard project={project} />);

      const actionMenu = screen.getByTestId('project-action-menu');
      expect(actionMenu).toHaveAttribute('data-project-id', 'project-456');
    });
  });

  describe('navigation', () => {
    it('should render link to project detail page', () => {
      const project = createMockProject({ $id: 'project-789', name: 'My Project' });
      renderWithRouter(<ProjectCard project={project} />);

      const link = screen.getByLabelText('Open project My Project');
      expect(link).toHaveAttribute('href', '/app/projects/project-789');
    });

    it('should have correct link structure for accessibility', () => {
      const project = createMockProject({ name: 'Accessible Project' });
      renderWithRouter(<ProjectCard project={project} />);

      const link = screen.getByLabelText('Open project Accessible Project');
      expect(link.tagName).toBe('A');
      expect(link).toHaveClass('absolute inset-0 z-10');
    });
  });

  describe('user interactions', () => {
    it('should be hoverable', () => {
      const project = createMockProject();
      const { container } = renderWithRouter(<ProjectCard project={project} />);

      const article = container.querySelector('article');
      expect(article).toHaveClass('hover:bg-secondary');
    });

    it('should show actions button on hover', () => {
      const project = createMockProject();
      renderWithRouter(<ProjectCard project={project} />);

      const actionsButton = screen.getByRole('button');
      expect(actionsButton).toHaveClass('opacity-0 group-hover/card:opacity-100');
    });

    it('should allow clicking more actions button', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ name: 'Test Project' });
      renderWithRouter(<ProjectCard project={project} />);

      const actionsButton = screen.getByLabelText('More actions for project Test Project');

      await user.click(actionsButton);

      expect(actionsButton).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for all interactive elements', () => {
      const project = createMockProject({ name: 'Accessible Project' });
      renderWithRouter(<ProjectCard project={project} />);

      expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Project: Accessible Project');
      expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Open project Accessible Project');
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'More actions for project Accessible Project');
    });

    it('should mark decorative icons as aria-hidden', () => {
      const project = createMockProject();
      const { container } = renderWithRouter(<ProjectCard project={project} />);

      const hashIcon = container.querySelector('svg');
      expect(hashIcon).toHaveAttribute('aria-hidden', 'true');

      const moreIcon = container.querySelectorAll('svg')[1];
      expect(moreIcon).toHaveAttribute('aria-hidden', 'true');
      expect(moreIcon).toHaveAttribute('focusable', 'false');
    });
  });

  describe('memo behavior', () => {
    it('should have displayName set correctly', () => {
      expect(ProjectCard.displayName).toBe('ProjectCard');
    });
  });

  describe('edge cases', () => {
    it('should handle projects with special characters in name', () => {
      const project = createMockProject({ name: 'Project & Task #1 <Test>' });
      renderWithRouter(<ProjectCard project={project} />);

      expect(screen.getByText('Project & Task #1 <Test>')).toBeInTheDocument();
    });

    it('should handle projects with empty name gracefully', () => {
      const project = createMockProject({ name: '' });
      renderWithRouter(<ProjectCard project={project} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should handle different color hex formats', () => {
      const project = createMockProject({ color_hex: '#ABC' });
      const { container } = renderWithRouter(<ProjectCard project={project} />);

      const hashIcon = container.querySelector('svg');
      expect(hashIcon).toHaveStyle({ color: project.color_hex });
    });
  });
});
