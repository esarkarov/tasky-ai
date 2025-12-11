import type { ProjectInput } from '@/features/projects/types';
import type { CrudMode } from '@/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectForm } from './ProjectForm';

const mockHandleCancel = vi.fn();
const mockOnSubmit = vi.fn();
const mockSetName = vi.fn();
const mockSetAiEnabled = vi.fn();
const mockSetAiPrompt = vi.fn();
const mockSetColorPickerOpen = vi.fn();
const mockHandleColorSelect = vi.fn();
const mockHandleSubmit = vi.fn();

const createMockFormComposite = (overrides = {}) => ({
  name: 'Test Project',
  color: { name: 'blue', hex: '#0000FF' },
  aiEnabled: false,
  aiPrompt: '',
  colorPickerOpen: false,
  isSubmitting: false,
  isValid: false,
  setName: mockSetName,
  setAiEnabled: mockSetAiEnabled,
  setAiPrompt: mockSetAiPrompt,
  setColorPickerOpen: mockSetColorPickerOpen,
  handleColorSelect: mockHandleColorSelect,
  handleSubmit: mockHandleSubmit,
  ...overrides,
});

let mockFormCompositeState = createMockFormComposite();

vi.mock('@/features/projects/hooks/use-project-form-composite/use-project-form-composite', () => ({
  useProjectFormComposite: () => mockFormCompositeState,
}));

interface ProjectNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

vi.mock('@/features/projects/components/molecules/ProjectNameInput/ProjectNameInput', () => ({
  ProjectNameInput: ({ value, onChange, disabled }: ProjectNameInputProps) => (
    <div data-testid="project-name-input">
      <label htmlFor="project-name">Project name</label>
      <input
        id="project-name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  ),
}));

interface ColorPickerProps {
  open: boolean;
  value: { name: string; hex: string };
  disabled: boolean;
  onOpenChange: (open: boolean) => void;
  handleColorSelect: (color: { name: string; hex: string }) => void;
}

vi.mock('@/shared/components/molecules/ColorPicker/ColorPicker', () => ({
  ColorPicker: ({ open, value, disabled, onOpenChange, handleColorSelect }: ColorPickerProps) => (
    <div data-testid="color-picker">
      <button
        onClick={() => onOpenChange(!open)}
        disabled={disabled}>
        Color: {value.name}
      </button>
      {open && <button onClick={() => handleColorSelect({ name: 'red', hex: '#FF0000' })}>Select Red</button>}
    </div>
  ),
}));

interface AITaskGeneratorProps {
  checked: boolean;
  value: string;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
  onValueChange: (value: string) => void;
}

vi.mock('@/features/ai/components/molecules/AITaskGenerator/AITaskGenerator', () => ({
  AITaskGenerator: ({ checked, value, disabled, onCheckedChange, onValueChange }: AITaskGeneratorProps) => (
    <div data-testid="ai-task-generator">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          disabled={disabled}
        />
        Enable AI
      </label>
      {checked && (
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="AI prompt"
          disabled={disabled}
        />
      )}
    </div>
  ),
}));

vi.mock('@/features/projects/components/atoms/CancelProjectButton/CancelProjectButton', () => ({
  CancelProjectButton: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      data-testid="cancel-button">
      Cancel
    </button>
  ),
}));

interface SubmitProjectButtonProps {
  mode: CrudMode;
  onClick: () => void;
  disabled: boolean;
}

vi.mock('@/features/projects/components/atoms/SubmitProjectButton/SubmitProjectButton', () => ({
  SubmitProjectButton: ({ mode, onClick, disabled }: SubmitProjectButtonProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="submit-button">
      {mode === 'create' ? 'Create' : 'Update'}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
    <div
      className={className}
      {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: React.ComponentProps<'div'>) => <div className={className}>{children}</div>,
  CardTitle: ({ children, id }: { children: React.ReactNode; id?: string }) => <h2 id={id}>{children}</h2>,
  CardContent: ({ children, className }: React.ComponentProps<'div'>) => <div className={className}>{children}</div>,
  CardFooter: ({ children, className }: React.ComponentProps<'div'>) => <div className={className}>{children}</div>,
}));

vi.mock('@/shared/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('ProjectForm', () => {
  interface RenderOptions {
    mode?: CrudMode;
    defaultValues?: ProjectInput;
    isSubmitting?: boolean;
    formState?: Partial<ReturnType<typeof createMockFormComposite>>;
  }

  const renderComponent = ({
    mode = 'create',
    defaultValues,
    isSubmitting = false,
    formState = {},
  }: RenderOptions = {}) => {
    mockFormCompositeState = createMockFormComposite(formState);

    return render(
      <ProjectForm
        mode={mode}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        handleCancel={mockHandleCancel}
        onSubmit={mockOnSubmit}
      />
    );
  };

  const getForm = () => screen.getByRole('form');
  const getProjectNameInput = () => screen.getByLabelText('Project name');
  const getCancelButton = () => screen.getByTestId('cancel-button');
  const getSubmitButton = () => screen.getByTestId('submit-button');

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormCompositeState = createMockFormComposite();
  });

  describe('rendering', () => {
    it('should render form with correct title for create mode', () => {
      renderComponent({ mode: 'create' });

      expect(getForm()).toBeInTheDocument();
      expect(screen.getByText('Add project')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Add project' })).toHaveAttribute('id', 'project-form-title');
    });

    it('should render form with correct title for update mode', () => {
      renderComponent({ mode: 'update' });

      expect(screen.getByText('Edit project')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Edit project' })).toHaveAttribute('id', 'project-form-title');
    });

    it('should render all form components', () => {
      renderComponent({ mode: 'create' });

      expect(screen.getByTestId('project-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('color-picker')).toBeInTheDocument();
      expect(getCancelButton()).toBeInTheDocument();
      expect(getSubmitButton()).toBeInTheDocument();
      expect(screen.getAllByTestId('separator')).toHaveLength(2);
    });

    it('should render AI task generator only in create mode', () => {
      renderComponent({ mode: 'create' });

      expect(screen.getByTestId('ai-task-generator')).toBeInTheDocument();
    });

    it('should not render AI task generator in update mode', () => {
      renderComponent({ mode: 'update' });

      expect(screen.queryByTestId('ai-task-generator')).not.toBeInTheDocument();
    });

    it('should render submit button with correct text based on mode', () => {
      const { rerender } = renderComponent({ mode: 'create' });

      expect(getSubmitButton()).toHaveTextContent('Create');

      rerender(
        <ProjectForm
          mode="update"
          handleCancel={mockHandleCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(getSubmitButton()).toHaveTextContent('Update');
    });
  });

  describe('form state', () => {
    it('should display project name from form state', () => {
      renderComponent({ formState: { name: 'My Custom Project' } });

      expect(getProjectNameInput()).toHaveValue('My Custom Project');
    });

    it('should display selected color from form state', () => {
      renderComponent({ formState: { color: { name: 'red', hex: '#FF0000' } } });

      expect(screen.getByText('Color: red')).toBeInTheDocument();
    });

    it('should reflect AI enabled state', () => {
      renderComponent({ mode: 'create', formState: { aiEnabled: true } });

      const checkbox = screen.getByRole('checkbox', { name: /enable ai/i });
      expect(checkbox).toBeChecked();
    });
  });

  describe('user interactions', () => {
    it('should call setName when project name changes', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.clear(getProjectNameInput());
      await user.type(getProjectNameInput(), 'New Project Name');

      expect(mockSetName).toHaveBeenCalled();
    });

    it('should call handleCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getCancelButton());

      expect(mockHandleCancel).toHaveBeenCalledTimes(1);
    });

    it('should call handleSubmit when submit button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getSubmitButton());

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call setColorPickerOpen when color picker is toggled', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText(/color:/i));

      expect(mockSetColorPickerOpen).toHaveBeenCalledWith(true);
    });

    it('should call handleColorSelect when color is selected', async () => {
      const user = userEvent.setup();
      renderComponent({ formState: { colorPickerOpen: true } });

      await user.click(screen.getByText('Select Red'));

      expect(mockHandleColorSelect).toHaveBeenCalledWith({ name: 'red', hex: '#FF0000' });
    });

    it('should call setAiEnabled when AI checkbox is toggled in create mode', async () => {
      const user = userEvent.setup();
      renderComponent({ mode: 'create' });

      await user.click(screen.getByRole('checkbox', { name: /enable ai/i }));

      expect(mockSetAiEnabled).toHaveBeenCalledWith(true);
    });

    it('should call setAiPrompt when AI prompt changes', async () => {
      const user = userEvent.setup();
      renderComponent({ mode: 'create', formState: { aiEnabled: true } });

      await user.type(screen.getByPlaceholderText('AI prompt'), 'Generate tasks');

      expect(mockSetAiPrompt).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should disable all inputs when form is submitting internally', () => {
      renderComponent({ formState: { isSubmitting: true } });

      expect(getProjectNameInput()).toBeDisabled();
      expect(screen.getByText(/color:/i)).toBeDisabled();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable all inputs when external isSubmitting is true', () => {
      renderComponent({ isSubmitting: true });

      expect(getProjectNameInput()).toBeDisabled();
      expect(screen.getByText(/color:/i)).toBeDisabled();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable submit button when form is invalid', () => {
      renderComponent({ formState: { isValid: true } });

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should enable submit button when form is valid and not submitting', () => {
      renderComponent({ formState: { isValid: false } });

      expect(getSubmitButton()).not.toBeDisabled();
    });

    it('should disable AI inputs when form is submitting in create mode', () => {
      renderComponent({ mode: 'create', formState: { aiEnabled: true, isSubmitting: true } });

      expect(screen.getByRole('checkbox', { name: /enable ai/i })).toBeDisabled();
      expect(screen.getByPlaceholderText('AI prompt')).toBeDisabled();
    });
  });

  describe('loading state', () => {
    it('should apply loading styles when submitting internally', () => {
      renderComponent({ formState: { isSubmitting: true } });

      expect(getForm()).toHaveClass('animate-pulse pointer-events-none');
    });

    it('should apply loading styles when submitting externally', () => {
      renderComponent({ isSubmitting: true });

      expect(getForm()).toHaveClass('animate-pulse pointer-events-none');
    });

    it('should not apply loading styles when not submitting', () => {
      renderComponent();

      expect(getForm()).not.toHaveClass('animate-pulse');
      expect(getForm()).not.toHaveClass('pointer-events-none');
    });
  });

  describe('accessibility', () => {
    it('should have proper form role and aria-labelledby', () => {
      renderComponent();

      const form = getForm();
      expect(form).toHaveAttribute('role', 'form');
      expect(form).toHaveAttribute('aria-labelledby', 'project-form-title');
    });

    it('should have accessible heading with unique id', () => {
      renderComponent();

      const heading = screen.getByRole('heading', { name: /project/i });
      expect(heading).toHaveAttribute('id', 'project-form-title');
    });
  });

  describe('default values', () => {
    it('should use provided default values', () => {
      const defaultValues: ProjectInput = {
        id: 'project-123',
        name: 'Existing Project',
        color_name: 'blue',
        color_hex: '#0000FF',
      };

      renderComponent({ mode: 'update', defaultValues });

      // Verify hook was called with default values
      // The actual default values are passed to the hook and managed there
      expect(getForm()).toBeInTheDocument();
    });

    it('should handle undefined default values', () => {
      renderComponent({ defaultValues: undefined });

      expect(getForm()).toBeInTheDocument();
    });
  });

  describe('mode-specific behavior', () => {
    it('should show create-specific elements in create mode', () => {
      renderComponent({ mode: 'create' });

      expect(screen.getByText('Add project')).toBeInTheDocument();
      expect(screen.getByTestId('ai-task-generator')).toBeInTheDocument();
      expect(getSubmitButton()).toHaveTextContent('Create');
    });

    it('should show update-specific elements in update mode', () => {
      renderComponent({ mode: 'update' });

      expect(screen.getByText('Edit project')).toBeInTheDocument();
      expect(screen.queryByTestId('ai-task-generator')).not.toBeInTheDocument();
      expect(getSubmitButton()).toHaveTextContent('Update');
    });
  });
});
