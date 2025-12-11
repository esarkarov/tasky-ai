import { ProjectSidebarNavLink } from '@/features/projects/components/molecules/ProjectSidebarNavLink/ProjectSidebarNavLink';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    PROJECT: (id: string) => `/project/${id}`,
  },
}));

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  asChild?: boolean;
}

interface RenderOptions {
  id?: string;
  name?: string;
  colorHex?: string;
  initialRoute?: string;
}

interface IconProps {
  color: string;
}

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, onClick, isActive }: SidebarMenuButtonProps) => (
    <div
      data-testid="sidebar-menu-button"
      data-active={isActive}
      onClick={onClick}>
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Hash: ({ color, ...props }: IconProps) => (
    <svg
      data-testid="hash-icon"
      data-color={color}
      aria-hidden="true"
      {...props}
    />
  ),
}));

describe('ProjectSidebarNavLink', () => {
  const mockOnClick = vi.fn();

  const renderComponent = ({
    id = '1',
    name = 'Test Project',
    colorHex = '#FF0000',
    initialRoute = '/inbox',
  }: RenderOptions = {}) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ProjectSidebarNavLink
          id={id}
          name={name}
          colorHex={colorHex}
          onClick={mockOnClick}
        />
      </MemoryRouter>
    );
  };

  const getLink = () => screen.getByRole('link');
  const getButton = () => screen.getByTestId('sidebar-menu-button');
  const getIcon = () => screen.getByTestId('hash-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render link with correct name, href, and aria-label', () => {
      renderComponent();

      const link = getLink();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/project/1');
      expect(link).toHaveAttribute('aria-label', 'Open project Test Project');
    });

    it('should render Hash icon with correct color', () => {
      renderComponent({ colorHex: '#00FF00' });

      const icon = getIcon();
      expect(icon).toHaveAttribute('data-color', '#00FF00');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('active state', () => {
    it('should be active when pathname matches project route', () => {
      renderComponent({ id: '1', initialRoute: '/project/1' });

      expect(getButton()).toHaveAttribute('data-active', 'true');
      expect(getLink()).toHaveAttribute('aria-current', 'page');
    });

    it('should be inactive when pathname does not match project route', () => {
      renderComponent({ id: '1', initialRoute: '/project/2' });

      expect(getButton()).toHaveAttribute('data-active', 'false');
      expect(getLink()).not.toHaveAttribute('aria-current');
    });
  });

  describe('user interactions', () => {
    it('should call onClick when link is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(getLink());

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times on repeated clicks', async () => {
      const user = userEvent.setup();
      renderComponent();

      const link = getLink();
      await user.click(link);
      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('different project data', () => {
    it('should render with different project id and update href', () => {
      renderComponent({ id: '123' });

      expect(getLink()).toHaveAttribute('href', '/project/123');
    });

    it('should render with different project name and update aria-label', () => {
      renderComponent({ name: 'New Project' });

      expect(screen.getByText('New Project')).toBeInTheDocument();
      expect(getLink()).toHaveAttribute('aria-label', 'Open project New Project');
    });

    it('should handle special characters in project name', () => {
      renderComponent({ name: 'Project #1 & More!' });

      expect(screen.getByText('Project #1 & More!')).toBeInTheDocument();
      expect(getLink()).toHaveAttribute('aria-label', 'Open project Project #1 & More!');
    });

    it('should handle empty project name', () => {
      renderComponent({ name: '' });

      expect(getLink()).toBeInTheDocument();
    });
  });
});
