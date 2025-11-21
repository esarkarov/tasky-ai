import type { ProjectInput } from '@/features/projects/types';
import type { HttpMethod } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectFormDialog } from './ProjectFormDialog';

const mockHandleSave = vi.fn();
const mockCancelForm = vi.fn();
const mockSetIsOpen = vi.fn();

let mockDisclosureState = {
  isOpen: false,
  setIsOpen: mockSetIsOpen,
  close: mockCancelForm,
  open: vi.fn(),
  toggle: vi.fn(),
};

vi.mock('@/shared/hooks/use-disclosure/use-disclosure', () => ({
  useDisclosure: () => mockDisclosureState,
}));

vi.mock('@/features/projects/hooks/use-project-modal/use-project-modal', () => ({
  useProjectModal: () => ({
    isLoading: false,
    handleSave: mockHandleSave,
    handleDelete: vi.fn(),
  }),
}));

vi.mock('@/features/projects/components/organisms/ProjectForm/ProjectForm', () => ({
  ProjectForm: ({
    mode,
    defaultValues,
    handleCancel,
    onSubmit,
    isSubmitting,
  }: {
    mode: string;
    defaultValues?: ProjectInput;
    handleCancel: () => void;
    onSubmit: (data: ProjectInput) => void;
    isSubmitting: boolean;
  }) => (
    <div data-testid="project-form">
      <div data-testid="form-mode">{mode}</div>
      {defaultValues && <div data-testid="default-values">{defaultValues.name}</div>}
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={() => onSubmit({ name: 'Test', color_name: 'blue', color_hex: '#0000FF' })}>Submit</button>
      {isSubmitting && <div data-testid="submitting">Submitting...</div>}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="dialog"
      data-open={open}>
      <div
        onClick={() => onOpenChange(!open)}
        data-testid="dialog-toggle"
      />
      {children}
    </div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
  DialogContent: ({
    children,
    className,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    className?: string;
    'aria-label'?: string;
  }) => (
    <div
      data-testid="dialog-content"
      className={className}
      aria-label={ariaLabel}>
      {children}
    </div>
  ),
}));

describe('ProjectFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDisclosureState = {
      isOpen: false,
      setIsOpen: mockSetIsOpen,
      close: mockCancelForm,
      open: vi.fn(),
      toggle: vi.fn(),
    };
  });

  describe('rendering', () => {
    it('should render dialog with trigger button', () => {
      render(
        <ProjectFormDialog method="POST">
          <button>Create Project</button>
        </ProjectFormDialog>
      );

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });

    it('should render create form when method is POST', () => {
      mockDisclosureState.isOpen = true;

      render(
        <ProjectFormDialog method="POST">
          <button>Create</button>
        </ProjectFormDialog>
      );

      expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
      expect(screen.getByLabelText('Create project form')).toBeInTheDocument();
    });

    it('should render update form when method is PUT', () => {
      mockDisclosureState.isOpen = true;

      render(
        <ProjectFormDialog method="PUT">
          <button>Edit</button>
        </ProjectFormDialog>
      );

      expect(screen.getByTestId('form-mode')).toHaveTextContent('update');
      expect(screen.getByLabelText('Edit project form')).toBeInTheDocument();
    });

    it('should pass default values to form', () => {
      mockDisclosureState.isOpen = true;

      const defaultValues: ProjectInput = {
        id: 'project-123',
        name: 'Test Project',
        color_name: 'red',
        color_hex: '#FF0000',
      };

      render(
        <ProjectFormDialog
          method="PUT"
          defaultValues={defaultValues}>
          <button>Edit</button>
        </ProjectFormDialog>
      );

      expect(screen.getByTestId('default-values')).toHaveTextContent('Test Project');
    });

    it('should apply custom styling to dialog content', () => {
      mockDisclosureState.isOpen = true;

      render(
        <ProjectFormDialog method="POST">
          <button>Create</button>
        </ProjectFormDialog>
      );

      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toHaveClass('p-0 border-0 !rounded-xl');
    });
  });

  describe('dialog state', () => {
    it('should control dialog open state', () => {
      render(
        <ProjectFormDialog method="POST">
          <button>Create</button>
        </ProjectFormDialog>
      );

      const dialog = screen.getByTestId('dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
    });

    it('should show dialog when open', () => {
      mockDisclosureState.isOpen = true;

      render(
        <ProjectFormDialog method="POST">
          <button>Create</button>
        </ProjectFormDialog>
      );

      const dialog = screen.getByTestId('dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
    });

    it('should call setIsOpen when dialog open state changes', async () => {
      const user = userEvent.setup();

      render(
        <ProjectFormDialog method="POST">
          <button>Create</button>
        </ProjectFormDialog>
      );

      const dialogToggle = screen.getByTestId('dialog-toggle');
      await user.click(dialogToggle);

      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });
  });

  describe('form interactions', () => {
    it('should call handleSave when form is submitted', async () => {
      mockDisclosureState.isOpen = true;
      const user = userEvent.setup();

      render(
        <ProjectFormDialog method="POST">
          <button>Create</button>
        </ProjectFormDialog>
      );

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      expect(mockHandleSave).toHaveBeenCalledWith({
        name: 'Test',
        color_name: 'blue',
        color_hex: '#0000FF',
      });
    });

    it('should call cancelForm when cancel is clicked', async () => {
      mockDisclosureState.isOpen = true;
      const user = userEvent.setup();

      render(
        <ProjectFormDialog method="POST">
          <button>Create</button>
        </ProjectFormDialog>
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockCancelForm).toHaveBeenCalled();
    });
  });

  // TODO: Fix this test case
  // describe('loading state', () => {
  //   it('should pass loading state to form', async () => {
  //     mockDisclosureState.isOpen = true;
  //     mockUseProjectModal.mockReturnValue({
  //       isLoading: true,
  //       handleSave: mockHandleSave,
  //       handleDelete: vi.fn(),
  //     });
  //     render(
  //       <ProjectFormDialog method="POST">
  //         <button>Create</button>
  //       </ProjectFormDialog>
  //     );
  //     expect(screen.getByTestId('submitting')).toBeInTheDocument();
  //   });
  // });

  describe('method handling', () => {
    const cases: Array<[HttpMethod, string]> = [
      ['POST', 'create'],
      ['PUT', 'update'],
      ['DELETE', 'update'],
      ['GET', 'update'],
    ];

    it.each(cases)('should set mode to %s for method %s', (method, expectedMode) => {
      mockDisclosureState.isOpen = true;

      render(
        <ProjectFormDialog method={method as HttpMethod}>
          <button>Button</button>
        </ProjectFormDialog>
      );

      expect(screen.getByTestId('form-mode')).toHaveTextContent(expectedMode);
    });
  });
});
