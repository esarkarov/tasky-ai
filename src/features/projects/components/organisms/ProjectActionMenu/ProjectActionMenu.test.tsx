import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ProjectActionMenu } from './ProjectActionMenu';
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

interface ProjectFormDialogProps {
  children: React.ReactNode;
  method: string;
  defaultValues: ProjectInput;
}

vi.mock('@/features/projects/components/organisms/ProjectFormDialog/ProjectFormDialog', () => ({
  ProjectFormDialog: ({ children, method, defaultValues }: ProjectFormDialogProps) => (
    <div
      data-testid="project-form-dialog"
      data-method={method}
      data-project-id={defaultValues.id}>
      {children}
    </div>
  ),
}));

interface ConfirmationDialogProps {
  id: string;
  label: string;
  handleDelete: (id: string, name: string) => void;
  variant: string;
  title: string;
}

vi.mock('@/shared/components/molecules/ConfirmationDialog/ConfirmationDialog', () => ({
  ConfirmationDialog: ({ id, label, handleDelete, variant, title }: ConfirmationDialogProps) => (
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
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid="dropdown-content"
      {...props}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-item">{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Edit: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid="edit-icon"
      aria-hidden="true"
      {...props}
    />
  ),
}));

describe('ProjectActionMenu', () => {
  interface RenderOptions {
    defaultValues?: ProjectInput;
  }

  const renderComponent = ({ defaultValues = createMockDefaultValues() }: RenderOptions = {}) => {
    return render(
      <ProjectActionMenu defaultValues={defaultValues}>
        <button>Actions</button>
      </ProjectActionMenu>
    );
  };

  const getDropdownContent = () => screen.getByTestId('dropdown-content');
  const getEditButton = (projectName: string) => screen.getByLabelText(`Edit project ${projectName}`);
  const getDeleteButton = () => screen.getByTestId('confirmation-dialog');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render dropdown menu with trigger button and content', () => {
      renderComponent();

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(getDropdownContent()).toBeInTheDocument();
    });

    it('should render menu content with correct aria-label', () => {
      renderComponent({ defaultValues: createMockDefaultValues({ name: 'My Project' }) });

      expect(getDropdownContent()).toHaveAttribute('aria-label', 'Actions for project My Project');
    });

    it('should render edit and delete actions in correct order', () => {
      const defaultValues = createMockDefaultValues();
      renderComponent({ defaultValues });

      const menuItems = screen.getAllByTestId('dropdown-item');
      expect(menuItems).toHaveLength(2);
      expect(menuItems[0]).toContainElement(screen.getByTestId('project-form-dialog'));
      expect(menuItems[1]).toContainElement(getDeleteButton());

      expect(getEditButton(defaultValues.name)).toHaveTextContent('Edit');
      expect(screen.getByText(`Delete ${defaultValues.name}`)).toBeInTheDocument();
    });
  });

  describe('edit functionality', () => {
    it('should render edit button with correct attributes and ProjectFormDialog', () => {
      const defaultValues = createMockDefaultValues({ id: 'project-456', name: 'Custom Project' });
      renderComponent({ defaultValues });

      const editButton = getEditButton('Custom Project');
      expect(editButton).toHaveClass('w-full justify-start px-2');
      expect(editButton).toHaveAttribute('type', 'button');

      const formDialog = screen.getByTestId('project-form-dialog');
      expect(formDialog).toHaveAttribute('data-method', 'PUT');
      expect(formDialog).toHaveAttribute('data-project-id', 'project-456');
    });
  });

  describe('delete functionality', () => {
    it('should render ConfirmationDialog with correct props', () => {
      renderComponent({ defaultValues: createMockDefaultValues({ name: 'Project to Delete' }) });

      const confirmDialog = getDeleteButton();
      expect(confirmDialog).toHaveAttribute('data-variant', 'menu-item');
      expect(confirmDialog).toHaveAttribute('data-title', 'Delete Project?');
    });

    it('should call handleDelete when delete is confirmed', async () => {
      const user = userEvent.setup();
      const defaultValues = createMockDefaultValues({ id: 'project-999', name: 'Delete Me' });
      renderComponent({ defaultValues });

      await user.click(getDeleteButton());

      expect(mockHandleDelete).toHaveBeenCalledWith('project-999', 'Delete Me');
      expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for dropdown and actions', () => {
      renderComponent({ defaultValues: createMockDefaultValues({ name: 'Accessible Project' }) });

      expect(getDropdownContent()).toHaveAttribute('aria-label', 'Actions for project Accessible Project');
      expect(screen.getByLabelText('Edit project Accessible Project')).toBeInTheDocument();
    });

    it('should hide decorative icon from screen readers', () => {
      renderComponent();

      const icon = screen.getByTestId('edit-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in project name', () => {
      renderComponent({ defaultValues: createMockDefaultValues({ name: 'Project & Task #1 <Special>' }) });

      expect(getDropdownContent()).toHaveAttribute('aria-label', 'Actions for project Project & Task #1 <Special>');
    });

    it('should handle projects without id', () => {
      renderComponent({ defaultValues: createMockDefaultValues({ id: undefined }) });

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });
  });
});
