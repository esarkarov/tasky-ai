import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectSidebarNavLink } from './ProjectSidebarNavLink';
import { MemoryRouter } from 'react-router';

vi.mock('@/shared/constants/routes', () => ({
  ROUTES: {
    PROJECT: (id: string) => `/project/${id}`,
  },
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarMenuButton: ({
    children,
    onClick,
    isActive,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
    asChild?: boolean;
  }) => (
    <div
      data-testid="sidebar-menu-button"
      data-active={isActive}
      onClick={onClick}>
      {children}
    </div>
  ),
}));

describe('ProjectSidebarNavLink', () => {
  const mockOnClick = vi.fn();

  const defaultProps = {
    id: '1',
    name: 'Test Project',
    colorHex: '#FF0000',
    onClick: mockOnClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render link with project name', () => {
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should render link with correct href', () => {
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/project/1');
    });

    it('should render link with aria-label', () => {
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      expect(screen.getByLabelText('Open project Test Project')).toBeInTheDocument();
    });

    it('should hide Hash icon from screen readers', () => {
      const { container } = render(
        <MemoryRouter>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should set isActive to true when pathname matches project route', () => {
      render(
        <MemoryRouter initialEntries={['/project/1']}>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      const button = screen.getByTestId('sidebar-menu-button');
      expect(button).toHaveAttribute('data-active', 'true');
    });

    it('should set isActive to false when pathname does not match', () => {
      render(
        <MemoryRouter initialEntries={['/project/2']}>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      const button = screen.getByTestId('sidebar-menu-button');
      expect(button).toHaveAttribute('data-active', 'false');
    });

    it('should set aria-current to page when link is active', () => {
      render(
        <MemoryRouter initialEntries={['/project/1']}>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('should not set aria-current when link is inactive', () => {
      render(
        <MemoryRouter initialEntries={['/project/2']}>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when link is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink {...defaultProps} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      await user.click(link);
      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('different props', () => {
    it('should render with different project id', () => {
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink
            {...defaultProps}
            id="123"
          />
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/project/123');
    });

    it('should render with different project name', () => {
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink
            {...defaultProps}
            name="New Project"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('New Project')).toBeInTheDocument();
      expect(screen.getByLabelText('Open project New Project')).toBeInTheDocument();
    });

    it('should handle special characters in project name', () => {
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink
            {...defaultProps}
            name="Project #1 & More!"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Project #1 & More!')).toBeInTheDocument();
      expect(screen.getByLabelText('Open project Project #1 & More!')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty project name', () => {
      render(
        <MemoryRouter>
          <ProjectSidebarNavLink
            {...defaultProps}
            name=""
          />
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    // TODO: fix this test case properly
    // it('should update active state when route changes', () => {
    //   const { rerender } = render(
    //     <MemoryRouter initialEntries={['/project/1']}>
    //       <ProjectSidebarNavLink {...defaultProps} />
    //     </MemoryRouter>
    //   );

    //   const button = screen.getByTestId('sidebar-menu-button');
    //   expect(button).toHaveAttribute('data-active', 'true');

    //   rerender(
    //     <MemoryRouter initialEntries={['/project/2']}>
    //       <ProjectSidebarNavLink {...defaultProps} />
    //     </MemoryRouter>
    //   );

    //   expect(button).toHaveAttribute('data-active', 'false');
    // });
  });
});
