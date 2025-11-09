import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  MoreHorizontal: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid="more-horizontal-icon"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  ),
}));

vi.mock('@/constants/routes', () => ({
  ROUTES: { PROJECTS: '/projects' },
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

describe('AllProjectsButton', () => {
  const mockOnClick = vi.fn();

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <AllProjectsButton onClick={mockOnClick} />
      </BrowserRouter>
    );
  const getLink = () => screen.getByRole('link', { name: /view all projects/i });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders link with correct text and icon', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });

      renderComponent();

      expect(screen.getByText('All projects')).toBeInTheDocument();
      expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
      expect(getLink()).toHaveAttribute('href', '/projects');
    });

    it('renders with SidebarMenuButton wrapper', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });
      renderComponent();

      expect(screen.getByTestId('sidebar-menu-button')).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('sets active attributes when on projects page', () => {
      mockUseLocation.mockReturnValue({ pathname: '/projects' });
      renderComponent();
      const button = screen.getByTestId('sidebar-menu-button');
      const link = getLink();

      expect(button).toHaveAttribute('data-active', 'true');
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('is not active when on other pages', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });
      renderComponent();
      const button = screen.getByTestId('sidebar-menu-button');
      const link = getLink();

      expect(button).toHaveAttribute('data-active', 'false');
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  describe('user interactions', () => {
    it('calls onClick when link is clicked', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });
      renderComponent();
      const link = getLink();

      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('is keyboard accessible (focus on Tab)', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });
      renderComponent();
      const link = getLink();

      await user.tab();

      expect(link).toHaveFocus();
    });

    it('calls onClick on Enter key press', async () => {
      const user = userEvent.setup();
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });
      renderComponent();
      const link = getLink();

      link.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label and title attributes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });
      renderComponent();
      const link = getLink();

      expect(link).toHaveAttribute('aria-label', 'View all projects');
      expect(link).toHaveAttribute('title', 'All projects');
    });

    it('hides icon from assistive technologies', () => {
      mockUseLocation.mockReturnValue({ pathname: '/inbox' });
      renderComponent();
      const icon = screen.getByTestId('more-horizontal-icon');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    });
  });

  describe('edge cases', () => {
    it('handles unexpected pathname gracefully', () => {
      mockUseLocation.mockReturnValue({ pathname: '/unknown' });
      renderComponent();
      const button = screen.getByTestId('sidebar-menu-button');
      const link = getLink();

      expect(button).toHaveAttribute('data-active', 'false');
      expect(link).not.toHaveAttribute('aria-current');
    });
  });
});
