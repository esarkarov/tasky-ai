import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectActionMenu } from './ProjectActionMenu';
import userEvent from '@testing-library/user-event';
import type { ProjectInput } from '@/features/projects/types';

const createMockDefaultValues = (overrides?: Partial<ProjectInput>): ProjectInput => ({
  id: 'project-123',
  name: 'Test Project',
  color_name: 'blue',
  color_hex: '#0000FF',
  ...overrides,
});

const mockHandleDelete = vi.fn();
vi.mock('@/features/projects/hooks/use-project-modal/use-project-modal', () => ({
  useProjectModal: () => ({
    handleDelete: mockHandleDelete,
    handleSave: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('@/features/projects/components/organisms/ProjectFormDialog/ProjectFormDialog', () => ({
  ProjectFormDialog: ({
    children,
    method,
    defaultValues,
  }: {
    children: React.ReactNode;
    method: string;
    defaultValues: ProjectInput;
  }) => (
    <div
      data-testid="project-form-dialog"
      data-method={method}
      data-project-id={defaultValues.id}>
      {children}
    </div>
  ),
}));

vi.mock('@/shared/components/molecules/ConfirmationDialog/ConfirmationDialog', () => ({
  ConfirmationDialog: ({
    id,
    label,
    handleDelete,
    variant,
    title,
  }: {
    id: string;
    label: string;
    handleDelete: (id: string, name: string) => void;
    variant: string;
    title: string;
  }) => (
    <button
      data-testid="confirmation-dialog"
      data-variant={variant}
      data-title={title}
      onClick={() => handleDelete(id, label)}>
      Delete {label}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}));

vi.mock('@/shared/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid="dropdown-content"
      {...props}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dropdown-item">{children}</div>
  ),
}));

describe('ProjectActionMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render dropdown menu structure', () => {
      const defaultValues = createMockDefaultValues();

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });

    it('should render trigger button', () => {
      const defaultValues = createMockDefaultValues();

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>More Actions</button>
        </ProjectActionMenu>
      );

      expect(screen.getByText('More Actions')).toBeInTheDocument();
    });

    it('should render menu with correct aria-label', () => {
      const defaultValues = createMockDefaultValues({ name: 'My Project' });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      expect(screen.getByTestId('dropdown-content')).toHaveAttribute('aria-label', 'Actions for project My Project');
    });

    it('should render edit action', () => {
      const defaultValues = createMockDefaultValues({ name: 'Test Project' });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const editButton = screen.getByLabelText('Edit project Test Project');
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveTextContent('Edit');
    });

    it('should render delete action', () => {
      const defaultValues = createMockDefaultValues({ name: 'Test Project' });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Test Project')).toBeInTheDocument();
    });
  });

  describe('edit functionality', () => {
    it('should render ProjectFormDialog with PUT method', () => {
      const defaultValues = createMockDefaultValues();

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const formDialog = screen.getByTestId('project-form-dialog');
      expect(formDialog).toHaveAttribute('data-method', 'PUT');
    });

    it('should pass default values to edit dialog', () => {
      const defaultValues = createMockDefaultValues({
        id: 'project-456',
        name: 'Custom Project',
      });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const formDialog = screen.getByTestId('project-form-dialog');
      expect(formDialog).toHaveAttribute('data-project-id', 'project-456');
    });

    it('should have correct edit button styling', () => {
      const defaultValues = createMockDefaultValues();

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const editButton = screen.getByLabelText(`Edit project ${defaultValues.name}`);
      expect(editButton).toHaveClass('w-full justify-start px-2');
      expect(editButton).toHaveAttribute('type', 'button');
    });
  });

  describe('delete functionality', () => {
    it('should render ConfirmationDialog with correct props', () => {
      const defaultValues = createMockDefaultValues({
        id: 'project-789',
        name: 'Project to Delete',
      });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const confirmDialog = screen.getByTestId('confirmation-dialog');
      expect(confirmDialog).toHaveAttribute('data-variant', 'menu-item');
      expect(confirmDialog).toHaveAttribute('data-title', 'Delete Project?');
    });

    it('should call handleDelete when delete is confirmed', async () => {
      const user = userEvent.setup();
      const defaultValues = createMockDefaultValues({
        id: 'project-999',
        name: 'Delete Me',
      });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const deleteButton = screen.getByTestId('confirmation-dialog');
      await user.click(deleteButton);

      expect(mockHandleDelete).toHaveBeenCalledWith('project-999', 'Delete Me');
    });
  });

  describe('dropdown structure', () => {
    it('should have two menu items', () => {
      const defaultValues = createMockDefaultValues();

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const menuItems = screen.getAllByTestId('dropdown-item');
      expect(menuItems).toHaveLength(2);
    });

    it('should render edit before delete', () => {
      const defaultValues = createMockDefaultValues();

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const menuItems = screen.getAllByTestId('dropdown-item');
      expect(menuItems[0]).toContainElement(screen.getByTestId('project-form-dialog'));
      expect(menuItems[1]).toContainElement(screen.getByTestId('confirmation-dialog'));
    });
  });

  describe('props forwarding', () => {
    it('should forward additional props to DropdownMenuContent', () => {
      const defaultValues = createMockDefaultValues();

      render(
        <ProjectActionMenu
          defaultValues={defaultValues}
          side="bottom"
          align="start">
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const dropdownContent = screen.getByTestId('dropdown-content');
      expect(dropdownContent).toHaveAttribute('side', 'bottom');
      expect(dropdownContent).toHaveAttribute('align', 'start');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for all actions', () => {
      const defaultValues = createMockDefaultValues({ name: 'Accessible Project' });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      expect(screen.getByTestId('dropdown-content')).toHaveAttribute(
        'aria-label',
        'Actions for project Accessible Project'
      );
      expect(screen.getByLabelText('Edit project Accessible Project')).toBeInTheDocument();
    });

    it('should mark decorative icons as aria-hidden', () => {
      const defaultValues = createMockDefaultValues();
      const { container } = render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      const editIcon = container.querySelector('svg');
      expect(editIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('edge cases', () => {
    it('should handle projects with special characters in name', () => {
      const defaultValues = createMockDefaultValues({
        name: 'Project & Task #1 <Special>',
      });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      expect(screen.getByTestId('dropdown-content')).toHaveAttribute(
        'aria-label',
        'Actions for project Project & Task #1 <Special>'
      );
    });

    it('should handle projects without id', () => {
      const defaultValues = createMockDefaultValues({ id: undefined });

      render(
        <ProjectActionMenu defaultValues={defaultValues}>
          <button>Actions</button>
        </ProjectActionMenu>
      );

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });
  });
});
