import { createMockProject } from '@/core/test-setup/factories';
import { Project } from '@/features/projects/types';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectBadge } from './ProjectBadge';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

vi.mock('lucide-react', () => ({
  Hash: ({ color, ...props }: IconProps) => (
    <svg
      data-testid="hash-icon"
      size={14}
      color={color}
      aria-hidden="true"
      {...props}
    />
  ),
  Inbox: ({ className, ...props }: IconProps) => (
    <svg
      data-testid="inbox-icon"
      size={14}
      className={className}
      aria-hidden="true"
      {...props}
    />
  ),
}));

describe('ProjectBadge', () => {
  const renderComponent = (project?: Project | null) => {
    render(<ProjectBadge project={project as Project} />);
  };

  const getContainer = () => screen.getByLabelText('Task project');
  const getHashIcon = () => screen.queryByTestId('hash-icon');
  const getInboxIcon = () => screen.queryByTestId('inbox-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering with project', () => {
    it('should render project name with Hash icon', () => {
      const project = createMockProject({ name: 'My Project' });

      renderComponent(project);

      expect(screen.getByText('My Project')).toBeInTheDocument();
      expect(getHashIcon()).toBeInTheDocument();
      expect(getInboxIcon()).not.toBeInTheDocument();
    });

    it('should apply project color to Hash icon', () => {
      const project = createMockProject({ color_hex: '#FF0000' });

      renderComponent(project);

      expect(getHashIcon()).toHaveAttribute('color', '#FF0000');
    });

    it('should configure Hash icon with correct size and accessibility', () => {
      const project = createMockProject();

      renderComponent(project);

      const icon = getHashIcon();
      expect(icon).toHaveAttribute('size', '14');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should handle long project names with truncation', () => {
      const project = createMockProject({
        name: 'This is a very long project name that should be truncated',
      });

      renderComponent(project);

      const nameElement = screen.getByText('This is a very long project name that should be truncated');
      expect(nameElement).toHaveClass('truncate');
    });

    it('should render project names with special characters', () => {
      const project = createMockProject({ name: 'Project #1 @ 2024' });

      renderComponent(project);

      expect(screen.getByText('Project #1 @ 2024')).toBeInTheDocument();
    });
  });

  describe('rendering without project', () => {
    it('should render "Inbox" text with Inbox icon when project is null', () => {
      renderComponent(null);

      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(getInboxIcon()).toBeInTheDocument();
      expect(getHashIcon()).not.toBeInTheDocument();
    });

    it('should render "Inbox" text with Inbox icon when project is undefined', () => {
      renderComponent(undefined);

      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(getInboxIcon()).toBeInTheDocument();
      expect(getHashIcon()).not.toBeInTheDocument();
    });

    it('should render "Inbox" when project name is empty', () => {
      const project = createMockProject({ name: '' });

      renderComponent(project);

      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('should configure Inbox icon with correct size, styling, and accessibility', () => {
      renderComponent(null);

      const icon = getInboxIcon();
      expect(icon).toHaveAttribute('size', '14');
      expect(icon).toHaveClass('text-muted-foreground');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on container with project', () => {
      const project = createMockProject();

      renderComponent(project);

      expect(getContainer()).toBeInTheDocument();
    });

    it('should have aria-label on container without project', () => {
      renderComponent(null);

      expect(getContainer()).toBeInTheDocument();
    });
  });
});
