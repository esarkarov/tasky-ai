import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskSidebarNavGroup } from './TaskSidebarNavGroup';
import type { TaskCounts } from '@/features/tasks/types';

vi.mock('@/shared/constants/app-links', () => ({
  TASK_SIDEBAR_LINKS: [
    { href: '/inbox', label: 'Inbox', icon: () => null },
    { href: '/today', label: 'Today', icon: () => null },
    { href: '/upcoming', label: 'Upcoming', icon: () => null },
  ],
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
      <span>Tasks: {link.href === '/inbox' ? taskCounts.inboxTasks : taskCounts.todayTasks}</span>
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

vi.mock('lucide-react', () => ({
  CirclePlus: () => (
    <span
      aria-hidden="true"
      data-testid="icon-wrapper">
      <svg data-testid="circle-plus-icon">+</svg>
    </span>
  ),
}));

describe('TaskSidebarNavGroup', () => {
  const mockHandleMobileNavigation = vi.fn();
  const mockTaskCounts: TaskCounts = {
    inboxTasks: 5,
    todayTasks: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render sidebar group with navigation role', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const sidebarGroup = screen.getByTestId('sidebar-group');
      expect(sidebarGroup).toHaveAttribute('role', 'navigation');
      expect(sidebarGroup).toHaveAttribute('aria-label', 'Primary navigation');
    });

    it('should render add task button', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const addButton = screen.getByTestId('add-task-button');
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveAttribute('aria-label', 'Add new task');
      expect(addButton).toHaveClass('!text-primary');
    });

    it('should render add task button inside TaskFormDialog', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      expect(screen.getByTestId('task-form-dialog')).toBeInTheDocument();
      expect(screen.getByText('Add task')).toBeInTheDocument();
    });

    it('should render CirclePlus icon', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      expect(screen.getByTestId('circle-plus-icon')).toBeInTheDocument();
    });

    it('should render all navigation links', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      expect(screen.getByTestId('nav-link-inbox')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-today')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-upcoming')).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should mark current path as active', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const inboxLink = screen.getByTestId('nav-link-inbox').querySelector('a');
      expect(inboxLink).toHaveAttribute('data-active', 'true');
    });

    it('should not mark other paths as active', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const todayLink = screen.getByTestId('nav-link-today').querySelector('a');
      const upcomingLink = screen.getByTestId('nav-link-upcoming').querySelector('a');

      expect(todayLink).toHaveAttribute('data-active', 'false');
      expect(upcomingLink).toHaveAttribute('data-active', 'false');
    });
  });

  describe('task counts', () => {
    it('should pass task counts to navigation links', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={{ inboxTasks: 10, todayTasks: 7 }}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const inboxLink = screen.getByTestId('nav-link-inbox');
      expect(inboxLink).toHaveTextContent('Tasks: 10');
    });

    it('should handle zero task counts', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={{ inboxTasks: 0, todayTasks: 0 }}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const inboxLink = screen.getByTestId('nav-link-inbox');
      expect(inboxLink).toHaveTextContent('Tasks: 0');
    });
  });

  describe('mobile navigation', () => {
    it('should call handleMobileNavigation when nav link is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const inboxLink = screen.getByTestId('nav-link-inbox').querySelector('a')!;
      await user.click(inboxLink);

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(1);
    });

    it('should call handleMobileNavigation for each clicked link', async () => {
      const user = userEvent.setup();
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const todayLink = screen.getByTestId('nav-link-today').querySelector('a')!;
      await user.click(todayLink);

      const upcomingLink = screen.getByTestId('nav-link-upcoming').querySelector('a')!;
      await user.click(upcomingLink);

      expect(mockHandleMobileNavigation).toHaveBeenCalledTimes(2);
    });
  });

  describe('structure', () => {
    it('should wrap navigation links in NavList components', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      expect(screen.getByTestId('nav-list-0')).toBeInTheDocument();
      expect(screen.getByTestId('nav-list-1')).toBeInTheDocument();
      expect(screen.getByTestId('nav-list-2')).toBeInTheDocument();
    });

    it('should have correct hierarchy of sidebar components', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      expect(screen.getByTestId('sidebar-group')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-group-content')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have navigation landmark with label', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('should have accessible add task button', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const addButton = screen.getByLabelText('Add new task');
      expect(addButton).toBeInTheDocument();
    });

    it('should hide icon from screen readers', () => {
      render(
        <TaskSidebarNavGroup
          currentPath="/inbox"
          taskCounts={mockTaskCounts}
          handleMobileNavigation={mockHandleMobileNavigation}
        />
      );

      const icon = screen.getByTestId('circle-plus-icon');
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
