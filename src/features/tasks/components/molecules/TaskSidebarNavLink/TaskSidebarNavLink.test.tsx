import { TaskCounts } from '@/features/tasks/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LucideIcon } from 'lucide-react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskSidebarNavLink } from './TaskSidebarNavLink';

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  getBadgeCount: vi.fn((href: string, taskCounts: TaskCounts) => {
    if (href === '/inbox') return taskCounts.inboxTasks;
    if (href === '/today') return taskCounts.todayTasks;
    return 0;
  }),
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({
    children,
    isActive,
    onClick,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <div
      data-testid="sidebar-menu-button"
      data-active={isActive}
      onClick={onClick}
      role="button">
      {children}
    </div>
  ),
  SidebarMenuBadge: ({ children, 'aria-label': ariaLabel }: { children: React.ReactNode; 'aria-label': string }) => (
    <span
      data-testid="sidebar-menu-badge"
      aria-label={ariaLabel}>
      {children}
    </span>
  ),
}));

describe('TaskSidebarNavLink', () => {
  const mockOnClick = vi.fn();

  const MockIcon: LucideIcon = Object.assign(
    (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        data-testid="mock-icon"
        {...props}>
        Icon
      </svg>
    ),
    { displayName: 'MockIcon' }
  ) as LucideIcon;

  const mockLink = {
    href: '/inbox',
    label: 'Inbox',
    icon: MockIcon,
  };

  const mockTaskCounts: TaskCounts = {
    inboxTasks: 5,
    todayTasks: 3,
  };

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render the sidebar menu item', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const menuButton = screen.getByTestId('sidebar-menu-button');
      expect(menuButton).toBeInTheDocument();
    });

    it('should render the link with correct href', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const link = screen.getByRole('link', { name: 'Inbox' });
      expect(link).toHaveAttribute('href', '/inbox');
    });

    it('should render the link label', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('should render the icon', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('active state', () => {
    it('should pass isActive prop to SidebarMenuButton', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={true}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const menuButton = screen.getByTestId('sidebar-menu-button');
      expect(menuButton).toHaveAttribute('data-active', 'true');
    });

    it('should set aria-current to "page" when active', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={true}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const link = screen.getByRole('link', { name: 'Inbox' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('should not set aria-current when inactive', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const link = screen.getByRole('link', { name: 'Inbox' });
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  describe('badge display', () => {
    it('should show badge when count is greater than 0', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={{ inboxTasks: 5, todayTasks: 3 }}
          onClick={mockOnClick}
        />
      );

      const badge = screen.getByTestId('sidebar-menu-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('5');
    });

    it('should not show badge when count is 0', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={{ inboxTasks: 0, todayTasks: 0 }}
          onClick={mockOnClick}
        />
      );

      const badge = screen.queryByTestId('sidebar-menu-badge');
      expect(badge).not.toBeInTheDocument();
    });

    it('should show correct count for today link', () => {
      const todayLink = {
        href: '/today',
        label: 'Today',
        icon: MockIcon,
      };

      renderWithRouter(
        <TaskSidebarNavLink
          link={todayLink}
          isActive={false}
          taskCounts={{ inboxTasks: 5, todayTasks: 3 }}
          onClick={mockOnClick}
        />
      );

      const badge = screen.getByTestId('sidebar-menu-badge');
      expect(badge).toHaveTextContent('3');
    });

    it('should have proper aria-label on badge', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={{ inboxTasks: 7, todayTasks: 3 }}
          onClick={mockOnClick}
        />
      );

      const badge = screen.getByTestId('sidebar-menu-badge');
      expect(badge).toHaveAttribute('aria-label', '7 tasks');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const menuButton = screen.getByTestId('sidebar-menu-button');
      await user.click(menuButton);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label on link', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const link = screen.getByLabelText('Inbox');
      expect(link).toBeInTheDocument();
    });

    it('should hide icon from screen readers', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should provide task count information to screen readers via badge', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={{ inboxTasks: 10, todayTasks: 3 }}
          onClick={mockOnClick}
        />
      );

      const badge = screen.getByLabelText('10 tasks');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('component memoization', () => {
    it('should have displayName set correctly', () => {
      expect(TaskSidebarNavLink.displayName).toBe('SideNavItem');
    });
  });

  describe('different link types', () => {
    it('should handle different routes correctly', () => {
      const projectLink = {
        href: '/projects',
        label: 'Projects',
        icon: MockIcon,
      };

      renderWithRouter(
        <TaskSidebarNavLink
          link={projectLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const link = screen.getByRole('link', { name: 'Projects' });
      expect(link).toHaveAttribute('href', '/projects');
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('should not show badge for routes not in getBadgeCount logic', () => {
      const projectLink = {
        href: '/projects',
        label: 'Projects',
        icon: MockIcon,
      };

      renderWithRouter(
        <TaskSidebarNavLink
          link={projectLink}
          isActive={false}
          taskCounts={mockTaskCounts}
          onClick={mockOnClick}
        />
      );

      const badge = screen.queryByTestId('sidebar-menu-badge');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle zero task counts', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={{ inboxTasks: 0, todayTasks: 0 }}
          onClick={mockOnClick}
        />
      );

      const badge = screen.queryByTestId('sidebar-menu-badge');
      expect(badge).not.toBeInTheDocument();
    });

    it('should handle large task counts', () => {
      renderWithRouter(
        <TaskSidebarNavLink
          link={mockLink}
          isActive={false}
          taskCounts={{ inboxTasks: 999, todayTasks: 3 }}
          onClick={mockOnClick}
        />
      );

      const badge = screen.getByTestId('sidebar-menu-badge');
      expect(badge).toHaveTextContent('999');
      expect(badge).toHaveAttribute('aria-label', '999 tasks');
    });
  });
});
