import { ProjectFormDialog } from '@/features/projects/components/organisms/ProjectFormDialog/ProjectFormDialog';
import type { ProjectInput } from '@/features/projects/types';
import type { HttpMethod } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHandleSave = vi.fn();
const mockClose = vi.fn();
const mockSetIsOpen = vi.fn();

const createMockDisclosureState = (isOpen = false) => ({
  isOpen,
  setIsOpen: mockSetIsOpen,
  close: mockClose,
  open: vi.fn(),
  toggle: vi.fn(),
});

let mockDisclosureState = createMockDisclosureState();

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

interface ProjectFormProps {
  mode: string;
  defaultValues?: ProjectInput;
  handleCancel: () => void;
  onSubmit: (data: ProjectInput) => void;
  isSubmitting: boolean;
}

vi.mock('@/features/projects/components/organisms/ProjectForm/ProjectForm', () => ({
  ProjectForm: ({ mode, defaultValues, handleCancel, onSubmit, isSubmitting }: ProjectFormProps) => (
    <div data-testid="project-form">
      <div data-testid="form-mode">{mode}</div>
      {defaultValues && <div data-testid="default-values">{defaultValues.name}</div>}
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={() => onSubmit({ name: 'Test', color_name: 'blue', color_hex: '#0000FF' })}>Submit</button>
      {isSubmitting && <div data-testid="submitting">Submitting...</div>}
    </div>
  ),
}));

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: DialogProps) => (
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
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children, className, 'aria-label': ariaLabel }: DialogContentProps) => (
    <div
      data-testid="dialog-content"
      className={className}
      aria-label={ariaLabel}>
      {children}
    </div>
  ),
}));

describe('ProjectFormDialog', () => {
  interface RenderOptions {
    method?: HttpMethod;
    defaultValues?: ProjectInput;
    isOpen?: boolean;
  }

  const renderComponent = ({ method = 'POST', defaultValues, isOpen = false }: RenderOptions = {}) => {
    mockDisclosureState = createMockDisclosureState(isOpen);
    return render(
      <ProjectFormDialog
        method={method}
        defaultValues={defaultValues}>
        <button>Trigger</button>
      </ProjectFormDialog>
    );
  };

  const getDialog = () => screen.getByTestId('dialog');
  const getDialogContent = () => screen.getByTestId('dialog-content');

  beforeEach(() => {
    vi.clearAllMocks();
    mockDisclosureState = createMockDisclosureState();
  });

  describe('rendering', () => {
    it('should render dialog with trigger button', () => {
      renderComponent();

      expect(getDialog()).toBeInTheDocument();
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });

    it('should render create form with correct mode and aria-label when method is POST', () => {
      renderComponent({ method: 'POST', isOpen: true });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
      expect(getDialogContent()).toHaveAttribute('aria-label', 'Create project form');
      expect(getDialogContent()).toHaveClass('p-0 border-0 !rounded-xl');
    });

    it('should render update form with correct mode and aria-label when method is PUT', () => {
      renderComponent({ method: 'PUT', isOpen: true });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('update');
      expect(getDialogContent()).toHaveAttribute('aria-label', 'Edit project form');
    });

    it('should pass default values to form', () => {
      const defaultValues: ProjectInput = {
        id: 'project-123',
        name: 'Test Project',
        color_name: 'red',
        color_hex: '#FF0000',
      };

      renderComponent({ method: 'PUT', defaultValues, isOpen: true });

      expect(screen.getByTestId('default-values')).toHaveTextContent('Test Project');
    });
  });

  describe('dialog state', () => {
    it('should be closed by default', () => {
      renderComponent();

      expect(getDialog()).toHaveAttribute('data-open', 'false');
    });

    it('should be open when isOpen is true', () => {
      renderComponent({ isOpen: true });

      expect(getDialog()).toHaveAttribute('data-open', 'true');
    });

    it('should call setIsOpen when dialog is toggled', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('dialog-toggle'));

      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
      expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('form interactions', () => {
    it('should call handleSave when form is submitted', async () => {
      const user = userEvent.setup();
      renderComponent({ isOpen: true });

      await user.click(screen.getByText('Submit'));

      expect(mockHandleSave).toHaveBeenCalledWith({
        name: 'Test',
        color_name: 'blue',
        color_hex: '#0000FF',
      });
      expect(mockHandleSave).toHaveBeenCalledTimes(1);
    });

    it('should call close when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ isOpen: true });

      await user.click(screen.getByText('Cancel'));

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('method handling', () => {
    it('should use create mode for POST method', () => {
      renderComponent({ method: 'POST', isOpen: true });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    });

    it('should use update mode for PUT method', () => {
      renderComponent({ method: 'PUT', isOpen: true });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('update');
    });

    it('should use update mode for non-POST methods', () => {
      renderComponent({ method: 'DELETE', isOpen: true });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('update');
    });
  });
});
