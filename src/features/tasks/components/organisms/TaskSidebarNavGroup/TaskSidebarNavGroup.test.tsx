import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskSidebarNavGroup } from './TaskSidebarNavGroup';
import type { TaskCounts } from '@/features/tasks/types';

vi.mock('lucide-react', () => ({
  CirclePlus: (props: Record<string, unknown>) => (
    <span
      aria-hidden="true"
      data-testid="icon-wrapper">
      <svg
        data-testid="circle-plus-icon"
        {...props}>
        +
      </svg>
    </span>
  ),
  Inbox: (props: Record<string, unknown>) => (
    <svg
      data-testid="inbox-icon"
      aria-hidden="true"
      {...props}
    />
  ),
  Calendar1: (props: Record<string, unknown>) => (
    <svg
      data-testid="calendar1-icon"
      aria-hidden="true"
      {...props}
    />
  ),
  CalendarDays: (props: Record<string, unknown>) => (
    <svg
      data-testid="calendar-days-icon"
      aria-hidden="true"
      {...props}
    />
  ),
  CircleCheck: (props: Record<string, unknown>) => (
    <svg
      data-testid="circle-check-icon"
      aria-hidden="true"
      {...props}
    />
  ),
  LayoutDashboard: (props: Record<string, unknown>) => (
    <svg
      data-testid="dashboard-icon"
      aria-hidden="true"
      {...props}
    />
  ),
}));

vi.mock('@/features/tasks/components/molecules/TaskSidebarNavLink/TaskSidebarNavLink', () => ({
  TaskSidebarNavLink: ({
    link,
    isActive,
    taskCounts,
    onClick,
  }: {
    link: { href: string; label: string };
    isActive: boolean;
    taskCounts: TaskCounts;
    onClick: () => void;
  }) => (
    <div data-testid={`nav-link-${link.label.toLowerCase()}`}>
      <a
        href={link.href}
        data-active={isActive}
        onClick={onClick}>
        {link.label}
      </a>
      <span>Tasks: {link.href.includes('inbox') ? taskCounts.inboxTasks : taskCounts.todayTasks}</span>
    </div>
  ),
}));

vi.mock('@/features/tasks/components/organisms/TaskFormDialog/TaskFormDialog', () => ({
  TaskFormDialog: ({ children }: { children: React.ReactNode }) => <div data-testid="task-form-dialog">{children}</div>,
}));

vi.mock('@/shared/components/atoms/List/List', () => ({
  NavList: ({ children, index }: { children: React.ReactNode; index: number }) => (
    <li data-testid={`nav-list-${index}`}>{children}</li>
  ),
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarGroup: ({
    children,
    role,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    role: string;
    'aria-label': string;
  }) => (
    <div
      data-testid="sidebar-group"
      role={role}
      aria-label={ariaLabel}>
      {children}
    </div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul data-testid="sidebar-menu">{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li data-testid="sidebar-menu-item">{children}</li>,
  SidebarMenuButton: ({
    children,
    className,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    className: string;
    'aria-label': string;
  }) => (
    <button
      data-testid="add-task-button"
      className={className}
      aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

describe('TaskSidebarNavGroup', () => {
  const mockHandleMobileNavigation = vi.fn();

  interface RenderOptions {
    currentPath?: string;
    taskCounts?: TaskCounts;
  }

  const renderComponent = ({
    currentPath = '/app/inbox',
    taskCounts = { inboxTasks: 5, todayTasks: 3 },
  }: RenderOptions = {}) => {
    return render(
      <TaskSidebarNavGroup
        currentPath={currentPath}
        taskCounts={taskCounts}
        handleMobileNavigation={mockHandleMobileNavigation}
      />
    );
  };

  const getNavLink = (label: string) => screen.getByTestId(`nav-link-${label.toLowerCase()}`);
  const getNavLinkAnchor = (label: string) => getNavLink(label).querySelector('a')!;
  const getAddTaskButton = () => screen.getByTestId('add-task-button');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render sidebar group with navigation role, add task button, and all nav links', () => {
      renderComponent();

      const sidebarGroup = screen.getByTestId('sidebar-group');
      expect(sidebarGroup).toHaveAttribute('role', 'navigation');
      expect(sidebarGroup).toHaveAttribute('aria-label', 'Primary navigation');

      const addButton = getAddTaskButton();
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveAttribute('aria-label', 'Add new task');
      expect(addButton).toHaveClass('!text-primary');
      expect(screen.getByText('Add task')).toBeInTheDocument();

      expect(screen.getByTestId('task-form-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('circle-plus-icon')).toBeInTheDocument();

      expect(getNavLink('inbox')).toBeInTheDocument();
      expect(getNavLink('today')).toBeInTheDocument();
      expect(getNavLink('upcoming')).toBeInTheDocument();
      expect(getNavLink('completed')).toBeInTheDocument();
    });

    it('should have correct hierarchy and structure', () => {
      renderComponent();

      expect(screen.getByTestId('sidebar-group')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-group-content')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
      expect(screen.getByTestId('nav-list-0')).toBeInTheDocument();
      expect(screen.getByTestId('nav-list-1')).toBeInTheDocument();
      expect(screen.getByTestId('nav-list-2')).toBeInTheDocument();
      expect(screen.getByTestId('nav-list-3')).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should mark current path as active and others as inactive', () => {
      renderComponent({ currentPath: '/app/inbox' });

      expect(getNavLinkAnchor('inbox')).toHaveAttribute('data-active', 'true');
      expect(getNavLinkAnchor('today')).toHaveAttribute('data-active', 'false');
      expect(getNavLinkAnchor('upcoming')).toHaveAttribute('data-active', 'false');
      expect(getNavLinkAnchor('completed')).toHaveAttribute('data-active', 'false');
    });

    it('should update active state based on current path', () => {
      renderComponent({ currentPath: '/app/today' });

      expect(getNavLinkAnchor('today')).toHaveAttribute('data-active', 'true');
      expect(getNavLinkAnchor('inbox')).toHaveAttribute('data-active', 'false');
    });
  });

  describe('task counts', () => {
    it('should display task counts correctly', () => {
      renderComponent({ taskCounts: { inboxTasks: 10, todayTasks: 7 } });

      expect(getNavLink('inbox')).toHaveTextContent('Tasks: 10');
      expect(getNavLink('today')).toHaveTextContent('Tasks: 7');
    });

    it('should handle zero task counts', () => {
      renderComponent({ taskCounts: { inboxTasks: 0, todayTasks: 0 } });

      expect(getNavLink('inbox')).toHaveTextContent('Tasks: 0');
      expect(getNavLink('today')).toHaveTextContent('Tasks: 0');
    });
  });

  describe('user interactions', () => {
    it('should call handleMobileNavigation when nav links are clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getNavLinkAnchor('inbox'));
      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);

      await user.click(getNavLinkAnchor('today'));
      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(2);

      await user.click(getNavLinkAnchor('upcoming'));
      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes and hide icons from screen readers', () => {
      renderComponent();

      expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
      expect(screen.getByLabelText('Add new task')).toBeInTheDocument();

      const circlePlusIcon = screen.getByTestId('circle-plus-icon');
      expect(circlePlusIcon.parentElement).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
