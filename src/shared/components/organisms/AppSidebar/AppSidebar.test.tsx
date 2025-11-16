import { AppSidebar } from '@/shared/components/organisms/AppSidebar/AppSidebar';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetOpenMobile = vi.fn();
let mockIsMobile = false;

const mockTaskCounts = {
  inbox: 5,
  today: 3,
};

vi.mock('@/shared/constants/routes', () => ({
  ROUTES: {
    INBOX: '/inbox',
  },
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/inbox' }),
    useLoaderData: () => ({ taskCounts: mockTaskCounts }),
  };
});

vi.mock('@/shared/components/ui/sidebar', () => ({
  Sidebar: ({ children, ...props }: { children: React.ReactNode }) => <nav {...props}>{children}</nav>,
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

vi.mock('@/features/projects/components/organisms/ProjectsSidebarSection/ProjectsSidebarSection', () => ({
  ProjectsSidebarSection: ({ handleMobileNavigation }: { handleMobileNavigation: () => void }) => (
    <div data-testid="projects-section">
      <button onClick={handleMobileNavigation}>Project Item</button>
    </div>
  ),
}));

vi.mock('@/features/tasks/components/organisms/TaskSidebarNavGroup/TaskSidebarNavGroup', () => ({
  TaskSidebarNavGroup: ({
    currentPath,
    taskCounts,
    handleMobileNavigation,
  }: {
    currentPath: string;
    taskCounts: { inbox: number; today: number };
    handleMobileNavigation: () => void;
  }) => (
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

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile = false;
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('should render sidebar with correct structure', () => {
      renderComponent();

      expect(screen.getByRole('navigation', { name: 'Main sidebar' })).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.getByTestId('task-nav-group')).toBeInTheDocument();
      expect(screen.getByTestId('projects-section')).toBeInTheDocument();
      expect(screen.getByTestId('user-chip')).toBeInTheDocument();
    });

    it('should render inbox link with logo', () => {
      renderComponent();

      const link = screen.getByLabelText('Go to inbox');
      expect(link).toHaveAttribute('href', '/inbox');
      expect(link).toContainElement(screen.getByTestId('logo'));
    });

    it('should pass current path to TaskSidebarNavGroup', () => {
      renderComponent();

      const taskNav = screen.getByTestId('task-nav-group');
      expect(taskNav).toHaveAttribute('data-path', '/inbox');
    });

    it('should pass task counts to TaskSidebarNavGroup', () => {
      renderComponent();

      expect(screen.getByText('Inbox: 5')).toBeInTheDocument();
      expect(screen.getByText('Today: 3')).toBeInTheDocument();
    });
  });

  describe('mobile navigation', () => {
    it('should close sidebar on mobile when task item is clicked', async () => {
      mockIsMobile = true;
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Task Item'));

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
      expect(mockSetOpenMobile).toHaveBeenCalledTimes(1);
    });

    it('should close sidebar on mobile when project item is clicked', async () => {
      mockIsMobile = true;
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Project Item'));

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
    });

    it('should not close sidebar on desktop when items are clicked', async () => {
      mockIsMobile = false;
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Task Item'));
      await user.click(screen.getByText('Project Item'));

      expect(mockSetOpenMobile).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();

      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main sidebar');
      expect(screen.getByLabelText('Go to inbox')).toBeInTheDocument();
    });
  });
});
