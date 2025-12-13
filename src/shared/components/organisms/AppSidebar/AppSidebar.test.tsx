import { AppSidebar } from '@/shared/components/organisms/AppSidebar/AppSidebar';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const mockSetOpenMobile = vi.fn();
let mockIsMobile = false;

const mockTaskCounts = {
  inbox: 5,
  today: 3,
};

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    INBOX: '/inbox',
  },
}));

const mockUseLocation = vi.fn();
const mockUseLoaderData = vi.fn();
vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>();
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
    useLoaderData: () => mockUseLoaderData(),
  };
});

vi.mock('@/shared/components/ui/sidebar', () => ({
  Sidebar: ({ children, ...props }: { children: React.ReactNode; role?: string; 'aria-label'?: string }) => (
    <nav {...props}>{children}</nav>
  ),
  SidebarHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <header className={className}>{children}</header>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
  useSidebar: () => ({
    isMobile: mockIsMobile,
    setOpenMobile: mockSetOpenMobile,
  }),
}));

interface ProjectsSidebarSectionProps {
  handleMobileNavigation: () => void;
}

vi.mock('@/features/projects/components/organisms/ProjectsSidebarSection/ProjectsSidebarSection', () => ({
  ProjectsSidebarSection: ({ handleMobileNavigation }: ProjectsSidebarSectionProps) => (
    <div data-testid="projects-section">
      <button onClick={handleMobileNavigation}>Project Item</button>
    </div>
  ),
}));

interface TaskSidebarNavGroupProps {
  currentPath: string;
  taskCounts: { inbox: number; today: number };
  handleMobileNavigation: () => void;
}

vi.mock('@/features/tasks/components/organisms/TaskSidebarNavGroup/TaskSidebarNavGroup', () => ({
  TaskSidebarNavGroup: ({ currentPath, taskCounts, handleMobileNavigation }: TaskSidebarNavGroupProps) => (
    <div
      data-testid="task-nav-group"
      data-path={currentPath}>
      <span>Inbox: {taskCounts.inbox}</span>
      <span>Today: {taskCounts.today}</span>
      <button onClick={handleMobileNavigation}>Task Item</button>
    </div>
  ),
}));

vi.mock('@/shared/components/atoms/Logo/Logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock('@/shared/components/atoms/UserChip/UserChip', () => ({
  UserChip: () => <div data-testid="user-chip">User</div>,
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <AppSidebar />
    </MemoryRouter>
  );

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile = false;
    (mockUseLocation as Mock).mockReturnValue({ pathname: '/inbox' });
    (mockUseLoaderData as Mock).mockReturnValue({ taskCounts: mockTaskCounts });
  });

  describe('basic rendering', () => {
    it('should render sidebar with all core components', () => {
      renderComponent();

      const nav = screen.getByRole('navigation', { name: 'Main sidebar' });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Main sidebar');

      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.getByTestId('task-nav-group')).toBeInTheDocument();
      expect(screen.getByTestId('projects-section')).toBeInTheDocument();
      expect(screen.getByTestId('user-chip')).toBeInTheDocument();
    });

    it('should render inbox link with logo and correct attributes', () => {
      renderComponent();

      const link = screen.getByLabelText('Go to inbox');
      expect(link).toHaveAttribute('href', '/inbox');
      expect(link).toContainElement(screen.getByTestId('logo'));
    });

    it('should pass correct props to TaskSidebarNavGroup', () => {
      renderComponent();

      const taskNav = screen.getByTestId('task-nav-group');
      expect(taskNav).toHaveAttribute('data-path', '/inbox');
      expect(screen.getByText('Inbox: 5')).toBeInTheDocument();
      expect(screen.getByText('Today: 3')).toBeInTheDocument();
    });
  });

  describe('mobile navigation', () => {
    it('should close sidebar when task item is clicked on mobile', async () => {
      mockIsMobile = true;
      const user = userEvent.setup();

      renderComponent();

      await user.click(screen.getByText('Task Item'));

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
      expect(mockSetOpenMobile).toHaveBeenCalledTimes(1);
    });

    it('should close sidebar when project item is clicked on mobile', async () => {
      mockIsMobile = true;
      const user = userEvent.setup();

      renderComponent();

      await user.click(screen.getByText('Project Item'));

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
      expect(mockSetOpenMobile).toHaveBeenCalledTimes(1);
    });

    it('should not close sidebar when items are clicked on desktop', async () => {
      mockIsMobile = false;
      const user = userEvent.setup();

      renderComponent();

      await user.click(screen.getByText('Task Item'));
      await user.click(screen.getByText('Project Item'));

      expect(mockSetOpenMobile).not.toHaveBeenCalled();
    });
  });
});
