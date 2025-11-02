import type { ProjectEntity } from '@/types/projects.types';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectBadge } from './ProjectBadge';

vi.mock('lucide-react', () => ({
  Hash: ({ ...props }) => (
    <svg
      data-testid="hash-icon"
      {...props}
    />
  ),
  Inbox: ({ ...props }) => (
    <svg
      data-testid="inbox-icon"
      {...props}
    />
  ),
}));

describe('ProjectBadge', () => {
  const createMockProject = (overrides?: Partial<ProjectEntity>): ProjectEntity => ({
    $id: 'project-1',
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('with project', () => {
    it('should render project name', () => {
      const project = createMockProject({ name: 'My Project' });
      render(<ProjectBadge project={project} />);

      expect(screen.getByText('My Project')).toBeInTheDocument();
    });

    it('should render Hash icon', () => {
      const project = createMockProject();
      render(<ProjectBadge project={project} />);

      expect(screen.getByTestId('hash-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('inbox-icon')).not.toBeInTheDocument();
    });

    it('should apply project color to Hash icon', () => {
      const project = createMockProject({ color_hex: '#FF0000' });
      render(<ProjectBadge project={project} />);

      const hashIcon = screen.getByTestId('hash-icon');
      expect(hashIcon).toHaveAttribute('color', '#FF0000');
    });

    it('should set Hash icon size to 14', () => {
      const project = createMockProject();
      render(<ProjectBadge project={project} />);

      const hashIcon = screen.getByTestId('hash-icon');
      expect(hashIcon).toHaveAttribute('size', '14');
    });

    it('should hide Hash icon from screen readers', () => {
      const project = createMockProject();
      render(<ProjectBadge project={project} />);

      const hashIcon = screen.getByTestId('hash-icon');
      expect(hashIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('without project (inbox)', () => {
    it('should render "Inbox" text when project is null', () => {
      render(<ProjectBadge project={null as unknown as ProjectEntity} />);

      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('should render "Inbox" text when project is undefined', () => {
      render(<ProjectBadge project={undefined as unknown as ProjectEntity} />);

      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('should render Inbox icon when project is null', () => {
      render(<ProjectBadge project={null as unknown as ProjectEntity} />);

      expect(screen.getByTestId('inbox-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('hash-icon')).not.toBeInTheDocument();
    });

    it('should set Inbox icon size to 14', () => {
      render(<ProjectBadge project={null as unknown as ProjectEntity} />);

      const inboxIcon = screen.getByTestId('inbox-icon');
      expect(inboxIcon).toHaveAttribute('size', '14');
    });

    it('should hide Inbox icon from screen readers', () => {
      render(<ProjectBadge project={null as unknown as ProjectEntity} />);

      const inboxIcon = screen.getByTestId('inbox-icon');
      expect(inboxIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should apply muted foreground class to Inbox icon', () => {
      render(<ProjectBadge project={null as unknown as ProjectEntity} />);

      const inboxIcon = screen.getByTestId('inbox-icon');
      expect(inboxIcon).toHaveClass('text-muted-foreground');
    });
  });

  describe('project name edge cases', () => {
    it('should handle long project names with truncation', () => {
      const project = createMockProject({
        name: 'This is a very long project name that should be truncated',
      });
      render(<ProjectBadge project={project} />);

      const nameElement = screen.getByText('This is a very long project name that should be truncated');
      expect(nameElement).toHaveClass('truncate');
    });

    it('should handle project with special characters', () => {
      const project = createMockProject({ name: 'Project #1 @ 2024' });
      render(<ProjectBadge project={project} />);

      expect(screen.getByText('Project #1 @ 2024')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on container', () => {
      const project = createMockProject();
      render(<ProjectBadge project={project} />);

      const container = screen.getByLabelText('Task project');
      expect(container).toBeInTheDocument();
    });

    it('should have aria-label when showing Inbox', () => {
      render(<ProjectBadge project={null as unknown as ProjectEntity} />);

      const container = screen.getByLabelText('Task project');
      expect(container).toBeInTheDocument();
    });
  });
});
