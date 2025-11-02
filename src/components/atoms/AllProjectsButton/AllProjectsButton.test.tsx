import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { AllProjectsButton } from './AllProjectsButton';

const mockUseLocation = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

vi.mock('lucide-react', () => ({
  MoreHorizontal: ({ ...props }) => (
    <svg
      data-testid="more-horizontal-icon"
      {...props}
    />
  ),
}));

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    PROJECTS: '/projects',
  },
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, isActive, ...props }: { children: React.ReactNode; isActive: boolean }) => (
    <div
      data-testid="sidebar-menu-button"
      data-active={isActive}
      {...props}>
      {children}
    </div>
  ),
}));

const renderComponent = (component: ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AllProjectsButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render link with correct text', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      expect(screen.getByText('All projects')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View all projects' })).toBeInTheDocument();
    });

    it('should render MoreHorizontal icon', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const icon = screen.getByTestId('more-horizontal-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should have correct href attribute', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const link = screen.getByRole('link', { name: 'View all projects' });
      expect(link).toHaveAttribute('href', '/projects');
    });
  });

  describe('active state', () => {
    it('should be active when on projects page', () => {
      mockUseLocation.mockReturnValue({ pathname: '/projects' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const button = screen.getByTestId('sidebar-menu-button');
      expect(button).toHaveAttribute('data-active', 'true');
    });

    it('should not be active when on other pages', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const button = screen.getByTestId('sidebar-menu-button');
      expect(button).toHaveAttribute('data-active', 'false');
    });

    it('should have aria-current when active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/projects' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const link = screen.getByRole('link', { name: 'View all projects' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('should not have aria-current when not active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const link = screen.getByRole('link', { name: 'View all projects' });
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const link = screen.getByRole('link', { name: 'View all projects' });
      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const link = screen.getByRole('link', { name: 'View all projects' });
      await user.tab();

      expect(link).toHaveFocus();
    });

    it('should trigger onClick on Enter key', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const link = screen.getByRole('link', { name: 'View all projects' });
      link.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on link', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const link = screen.getByRole('link', { name: 'View all projects' });
      expect(link).toHaveAttribute('aria-label', 'View all projects');
    });

    it('should have title attribute', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const link = screen.getByRole('link', { name: 'View all projects' });
      expect(link).toHaveAttribute('title', 'All projects');
    });

    it('should hide icon from screen readers', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent(<AllProjectsButton onClick={mockOnClick} />);

      const icon = screen.getByTestId('more-horizontal-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    });
  });
});
