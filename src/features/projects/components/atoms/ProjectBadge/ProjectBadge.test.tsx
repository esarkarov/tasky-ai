import { Project } from '@/features/projects/types';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectBadge } from './ProjectBadge';

vi.mock('lucide-react', () => ({
  Hash: (props: Record<string, unknown>) => (
    <svg
      data-testid="hash-icon"
      {...props}
    />
  ),
  Inbox: (props: Record<string, unknown>) => (
    <svg
      data-testid="inbox-icon"
      {...props}
    />
  ),
}));

describe('ProjectBadge', () => {
  const createMockProject = (overrides?: Partial<Project>): Project => ({
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
  const setup = (project?: Project | null) => {
    render(<ProjectBadge project={project as Project} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with project', () => {
    it('renders project name', () => {
      const project = createMockProject({ name: 'My Project' });
      setup(project);
      expect(screen.getByText('My Project')).toBeInTheDocument();
    });

    it('renders Hash icon and not Inbox icon', () => {
      const project = createMockProject();
      setup(project);
      expect(screen.getByTestId('hash-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('inbox-icon')).not.toBeInTheDocument();
    });

    it('applies project color to Hash icon', () => {
      const project = createMockProject({ color_hex: '#FF0000' });
      setup(project);
      expect(screen.getByTestId('hash-icon')).toHaveAttribute('color', '#FF0000');
    });

    it('sets Hash icon size to 14', () => {
      const project = createMockProject();
      setup(project);
      expect(screen.getByTestId('hash-icon')).toHaveAttribute('size', '14');
    });

    it('hides Hash icon from assistive tech', () => {
      const project = createMockProject();
      setup(project);
      expect(screen.getByTestId('hash-icon')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Rendering without project (Inbox)', () => {
    it('renders "Inbox" text when project is null', () => {
      setup(null);
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('renders "Inbox" text when project is undefined', () => {
      setup(undefined);
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('renders Inbox icon and not Hash icon', () => {
      setup(null);
      expect(screen.getByTestId('inbox-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('hash-icon')).not.toBeInTheDocument();
    });

    it('sets Inbox icon size to 14', () => {
      setup(null);
      expect(screen.getByTestId('inbox-icon')).toHaveAttribute('size', '14');
    });

    it('hides Inbox icon from assistive tech', () => {
      setup(null);
      expect(screen.getByTestId('inbox-icon')).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies muted text color to Inbox icon', () => {
      setup(null);
      expect(screen.getByTestId('inbox-icon')).toHaveClass('text-muted-foreground');
    });
  });

  describe('Project name variations', () => {
    it('handles long project names with truncation', () => {
      const project = createMockProject({
        name: 'This is a very long project name that should be truncated',
      });
      setup(project);
      const nameElement = screen.getByText('This is a very long project name that should be truncated');
      expect(nameElement).toHaveClass('truncate');
    });

    it('renders names with special characters', () => {
      const project = createMockProject({ name: 'Project #1 @ 2024' });
      setup(project);
      expect(screen.getByText('Project #1 @ 2024')).toBeInTheDocument();
    });

    it('renders empty project name as "Inbox"', () => {
      const project = createMockProject({ name: '' });
      setup(project);
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on container when project exists', () => {
      const project = createMockProject();
      setup(project);
      expect(screen.getByLabelText('Task project')).toBeInTheDocument();
    });

    it('has aria-label on container when showing Inbox', () => {
      setup(null);
      expect(screen.getByLabelText('Task project')).toBeInTheDocument();
    });
  });
});
