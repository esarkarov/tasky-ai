import {
  type AllProjectsButtonProps,
  AllProjectsButton,
} from '@/features/projects/components/atoms/AllProjectsButton/AllProjectsButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseLocation = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

vi.mock('lucide-react', () => ({
  MoreHorizontal: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid="more-horizontal-icon"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  ),
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: { PROJECTS: '/projects' },
}));

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  isActive: boolean;
}

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, isActive, ...props }: SidebarMenuButtonProps) => (
    <div
      data-testid="sidebar-menu-button"
      data-active={isActive}
      {...props}>
      {children}
    </div>
  ),
}));

describe('AllProjectsButton', () => {
  const mockOnClick = vi.fn();

  const renderComponent = (props: Partial<AllProjectsButtonProps> = {}) =>
    render(
      <BrowserRouter>
        <AllProjectsButton
          onClick={mockOnClick}
          {...props}
        />
      </BrowserRouter>
    );

  const getLink = () => screen.getByRole('link', { name: /view all projects/i });
  const getButton = () => screen.getByTestId('sidebar-menu-button');
  const getIcon = () => screen.getByTestId('more-horizontal-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render link with correct text and attributes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent();

      const link = getLink();
      expect(screen.getByText('All projects')).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/projects');
      expect(link).toHaveAttribute('aria-label', 'View all projects');
      expect(link).toHaveAttribute('title', 'All projects');
    });

    it('should render icon with proper accessibility attributes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent();

      const icon = getIcon();
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    });

    it('should render within SidebarMenuButton wrapper', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent();

      expect(getButton()).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should be active when on projects page', () => {
      mockUseLocation.mockReturnValue({ pathname: '/projects' });

      renderComponent();

      const button = getButton();
      const link = getLink();
      expect(button).toHaveAttribute('data-active', 'true');
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('should not be active when on different page', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent();

      const button = getButton();
      const link = getLink();
      expect(button).toHaveAttribute('data-active', 'false');
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when link is clicked', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent();
      const link = getLink();
      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Tab key', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent();
      const link = getLink();
      await user.tab();

      expect(link).toHaveFocus();
    });

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent();
      const link = getLink();
      link.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});
