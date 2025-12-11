import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectSearchField } from './ProjectSearchField';
import type { ChangeEvent } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

vi.mock('lucide-react', () => ({
  Search: ({ size, className, ...props }: IconProps) => (
    <svg
      data-testid="search-icon"
      data-size={size}
      className={className}
      aria-hidden="true"
      {...props}
    />
  ),
  Loader2: ({ size, className, ...props }: IconProps) => (
    <svg
      data-testid="loader-icon"
      data-size={size}
      className={className}
      {...props}
    />
  ),
}));

vi.mock('@/shared/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' '),
}));

describe('ProjectSearchField', () => {
  const mockOnChange = vi.fn();

  interface RenderOptions {
    isLoading?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  }

  const renderComponent = ({ isLoading = false, onChange = mockOnChange }: RenderOptions = {}) => {
    return render(
      <ProjectSearchField
        onChange={onChange}
        isLoading={isLoading}
      />
    );
  };

  const getSearchInput = () => screen.getByRole('searchbox', { name: /search projects/i });
  const getSearchIcon = () => screen.getByTestId('search-icon');
  const getLoaderIcon = () => screen.getByTestId('loader-icon');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render search input with correct attributes and label', () => {
      renderComponent();

      const input = getSearchInput();
      const label = screen.getByText('Search projects');

      expect(input).toHaveAttribute('type', 'search');
      expect(input).toHaveAttribute('id', 'project-search');
      expect(input).toHaveAttribute('name', 'q');
      expect(input).toHaveAttribute('placeholder', 'Search projects');
      expect(label).toHaveAttribute('for', 'project-search');
      expect(label).toHaveClass('sr-only');
    });

    it('should render search and loader icons with correct size', () => {
      renderComponent();

      expect(getSearchIcon()).toHaveAttribute('data-size', '18');
      expect(getLoaderIcon()).toHaveAttribute('data-size', '18');
    });
  });

  describe('loading state', () => {
    it('should hide loader and show idle status when not loading', () => {
      renderComponent({ isLoading: false });

      const loader = getLoaderIcon();
      const status = screen.getByText('Idle');

      expect(loader).toHaveClass('hidden');
      expect(loader).not.toHaveClass('animate-spin');
      expect(loader).toHaveAttribute('aria-hidden', 'true');
      expect(status).toBeInTheDocument();
    });

    it('should show loader with spin animation when loading', () => {
      renderComponent({ isLoading: true });

      const loader = getLoaderIcon();
      const status = screen.getByText('Searching...');

      expect(loader).toHaveClass('block');
      expect(loader).toHaveClass('animate-spin');
      expect(loader).toHaveAttribute('aria-hidden', 'false');
      expect(status).toBeInTheDocument();
    });

    it('should update status message when loading state changes', () => {
      const { rerender } = renderComponent({ isLoading: false });

      expect(screen.getByText('Idle')).toBeInTheDocument();

      rerender(
        <ProjectSearchField
          onChange={mockOnChange}
          isLoading={true}
        />
      );

      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = getSearchInput();
      await user.type(input, 'Project Alpha');

      expect(mockOnChange).toHaveBeenCalledTimes(13);
      expect(input).toHaveValue('Project Alpha');
    });

    it('should allow clearing the input', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = getSearchInput();
      await user.type(input, 'Test');
      await user.clear(input);

      expect(input).toHaveValue('');
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.type(getSearchInput(), '#@!');

      expect(getSearchInput()).toHaveValue('#@!');
    });
  });

  describe('accessibility', () => {
    it('should associate input with status message and have live region', () => {
      renderComponent();

      const input = getSearchInput();
      const status = screen.getByText('Idle');

      expect(input).toHaveAttribute('aria-describedby', 'search-status');
      expect(status).toHaveAttribute('id', 'search-status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveClass('sr-only');
    });

    it('should hide decorative icons from screen readers', () => {
      renderComponent();

      expect(getSearchIcon()).toHaveAttribute('aria-hidden', 'true');
      expect(getLoaderIcon()).toHaveClass('pointer-events-none');
    });

    it('should toggle loader aria-hidden based on loading state', () => {
      const { rerender } = renderComponent({ isLoading: false });

      expect(getLoaderIcon()).toHaveAttribute('aria-hidden', 'true');

      rerender(
        <ProjectSearchField
          onChange={mockOnChange}
          isLoading={true}
        />
      );

      expect(getLoaderIcon()).toHaveAttribute('aria-hidden', 'false');
    });
  });
});
