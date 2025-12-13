import { TaskSidebarNavLink } from '@/features/tasks/components/molecules/TaskSidebarNavLink/TaskSidebarNavLink';
import type { TaskCounts } from '@/features/tasks/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LucideIcon } from 'lucide-react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
        aria-hidden="true"
        {...props}>
        Icon
      </svg>
    ),
    { displayName: 'MockIcon' }
  ) as LucideIcon;

  interface RenderOptions {
    href?: string;
    label?: string;
    isActive?: boolean;
    taskCounts?: TaskCounts;
  }

  const renderComponent = ({
    href = '/inbox',
    label = 'Inbox',
    isActive = false,
    taskCounts = { inboxTasks: 5, todayTasks: 3 },
  }: RenderOptions = {}) => {
    const link = { href, label, icon: MockIcon };
    return render(
      <MemoryRouter>
        <TaskSidebarNavLink
          link={link}
          isActive={isActive}
          taskCounts={taskCounts}
          onClick={mockOnClick}
        />
      </MemoryRouter>
    );
  };

  const getMenuButton = () => screen.getByTestId('sidebar-menu-button');
  const getLink = (name: string) => screen.getByRole('link', { name });
  const getBadge = () => screen.queryByTestId('sidebar-menu-badge');
  const getIcon = () => screen.getByTestId('mock-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render link with correct href, label, and icon', () => {
      renderComponent();

      expect(getMenuButton()).toBeInTheDocument();
      const link = getLink('Inbox');
      expect(link).toHaveAttribute('href', '/inbox');
      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(getIcon()).toBeInTheDocument();
    });

    it('should render different link types correctly', () => {
      renderComponent({ href: '/projects', label: 'Projects' });

      const link = getLink('Projects');
      expect(link).toHaveAttribute('href', '/projects');
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should set correct attributes when active', () => {
      renderComponent({ isActive: true });

      expect(getMenuButton()).toHaveAttribute('data-active', 'true');
      expect(getLink('Inbox')).toHaveAttribute('aria-current', 'page');
    });

    it('should not set aria-current when inactive', () => {
      renderComponent({ isActive: false });

      expect(getMenuButton()).toHaveAttribute('data-active', 'false');
      expect(getLink('Inbox')).not.toHaveAttribute('aria-current');
    });
  });

  describe('badge display', () => {
    it('should show badge with correct count when greater than 0', () => {
      renderComponent({ taskCounts: { inboxTasks: 7, todayTasks: 3 } });

      const badge = getBadge();
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('7');
      expect(badge).toHaveAttribute('aria-label', '7 tasks');
    });

    it('should show correct count for today link', () => {
      renderComponent({ href: '/today', label: 'Today', taskCounts: { inboxTasks: 5, todayTasks: 3 } });

      expect(getBadge()).toHaveTextContent('3');
    });

    it('should not show badge when count is 0 or route not tracked', () => {
      renderComponent({ taskCounts: { inboxTasks: 0, todayTasks: 0 } });
      expect(getBadge()).not.toBeInTheDocument();

      renderComponent({ href: '/projects', label: 'Projects' });
      expect(getBadge()).not.toBeInTheDocument();
    });

    it('should handle large task counts', () => {
      renderComponent({ taskCounts: { inboxTasks: 999, todayTasks: 3 } });

      const badge = getBadge();
      expect(badge).toHaveTextContent('999');
      expect(badge).toHaveAttribute('aria-label', '999 tasks');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getMenuButton());

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label and hide icon from screen readers', () => {
      renderComponent();

      expect(screen.getByLabelText('Inbox')).toBeInTheDocument();
      expect(getIcon()).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('component memoization', () => {
    it('should have displayName set correctly', () => {
      expect(TaskSidebarNavLink.displayName).toBe('SideNavItem');
    });
  });
});
