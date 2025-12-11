import { createMockProject } from '@/core/test-setup/factories';
import { ProjectCard } from '@/features/projects/components/organisms/ProjectCard/ProjectCard';
import type { Project } from '@/features/projects/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface ProjectActionMenuProps {
  children: React.ReactNode;
  defaultValues: {
    id: string;
    name: string;
    color_name: string;
    color_hex: string;
  };
}

vi.mock('@/features/projects/components/organisms/ProjectActionMenu/ProjectActionMenu', () => ({
  ProjectActionMenu: ({ children, defaultValues }: ProjectActionMenuProps) => (
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

interface IconProps {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

vi.mock('lucide-react', () => ({
  Hash: ({ size, style, className, ...props }: IconProps) => (
    <svg
      data-testid="hash-icon"
      data-size={size}
      style={style}
      className={className}
      aria-hidden="true"
      {...props}
    />
  ),
  MoreHorizontal: (props: IconProps) => (
    <svg
      data-testid="more-horizontal-icon"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  ),
}));

describe('ProjectCard', () => {
  interface RenderOptions {
    project?: Project;
  }

  const renderComponent = ({ project = createMockProject() }: RenderOptions = {}) => {
    return render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>
    );
  };

  const getCard = () => screen.getByRole('article');
  const getLink = () => screen.getByRole('link');
  const getActionsButton = () => screen.getByRole('button');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render project card with name and correct aria-label', () => {
      const project = createMockProject({ name: 'My Awesome Project' });
      renderComponent({ project });

      expect(screen.getByText('My Awesome Project')).toBeInTheDocument();
      expect(getCard()).toHaveAttribute('aria-label', 'Project: My Awesome Project');
    });

    it('should render Hash icon with project color', () => {
      const project = createMockProject({ color_hex: '#FF0000' });
      renderComponent({ project });

      const hashIcon = screen.getByTestId('hash-icon');
      expect(hashIcon).toHaveStyle({ color: '#FF0000' });
      expect(hashIcon).toHaveAttribute('data-size', '16');
      expect(hashIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render link to project detail page', () => {
      const project = createMockProject({ $id: 'project-789', name: 'My Project' });
      renderComponent({ project });

      const link = getLink();
      expect(link).toHaveAttribute('href', '/app/projects/project-789');
      expect(link).toHaveAttribute('aria-label', 'Open project My Project');
      expect(link).toHaveClass('absolute inset-0 z-10');
    });

    it('should render actions button with ProjectActionMenu', () => {
      const project = createMockProject({ $id: 'project-456', name: 'Test Project' });
      renderComponent({ project });

      const actionsButton = getActionsButton();
      expect(actionsButton).toHaveAttribute('aria-label', 'More actions for project Test Project');
      expect(actionsButton).toHaveClass('opacity-0 group-hover/card:opacity-100');

      const actionMenu = screen.getByTestId('project-action-menu');
      expect(actionMenu).toHaveAttribute('data-project-id', 'project-456');
    });
  });

  describe('user interactions', () => {
    it('should have hover styles on card', () => {
      renderComponent();

      expect(getCard()).toHaveClass('hover:bg-secondary');
    });

    it('should be clickable via actions button', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ name: 'Test Project' });
      renderComponent({ project });

      await user.click(getActionsButton());

      expect(getActionsButton()).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for all interactive elements', () => {
      const project = createMockProject({ name: 'Accessible Project' });
      renderComponent({ project });

      expect(getCard()).toHaveAttribute('aria-label', 'Project: Accessible Project');
      expect(getLink()).toHaveAttribute('aria-label', 'Open project Accessible Project');
      expect(getActionsButton()).toHaveAttribute('aria-label', 'More actions for project Accessible Project');
    });

    it('should hide decorative icons from screen readers', () => {
      renderComponent();

      const hashIcon = screen.getByTestId('hash-icon');
      expect(hashIcon).toHaveAttribute('aria-hidden', 'true');

      const moreIcon = screen.getByTestId('more-horizontal-icon');
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
    it('should handle special characters in project name', () => {
      const project = createMockProject({ name: 'Project & Task #1 <Test>' });
      renderComponent({ project });

      expect(screen.getByText('Project & Task #1 <Test>')).toBeInTheDocument();
    });

    it('should handle empty project name', () => {
      const project = createMockProject({ name: '' });
      renderComponent({ project });

      expect(getCard()).toBeInTheDocument();
    });

    it('should handle short hex color format', () => {
      const project = createMockProject({ color_hex: '#ABC' });
      renderComponent({ project });

      const hashIcon = screen.getByTestId('hash-icon');
      expect(hashIcon).toHaveStyle({ color: '#ABC' });
    });
  });
});
