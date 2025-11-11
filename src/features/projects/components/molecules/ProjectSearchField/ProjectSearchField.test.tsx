import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectSearchField } from './ProjectSearchField';
import { SearchStatus } from '@/shared/types';

vi.mock('@/shared/components/ui/input', () => ({
  Input: ({ onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      onChange={onChange}
      {...props}
    />
  ),
}));

vi.mock('@/shared/utils/ui/ui.utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('ProjectSearchField', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    onChange: mockOnChange,
    searchStatus: 'idle' as SearchStatus,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render search input with correct placeholder', () => {
      render(<ProjectSearchField {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search projects')).toBeInTheDocument();
    });

    it('should render search input with correct type', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render search input with correct id', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('id', 'project-search');
    });

    it('should render search input with correct name attribute', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('name', 'q');
    });

    it('should render visually hidden label', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const label = screen.getByText('Search projects');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('sr-only');
    });

    it('should render search icon with aria-hidden', () => {
      const { container } = render(<ProjectSearchField {...defaultProps} />);

      const searchIcon = container.querySelector('[aria-hidden="true"]');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChange when user types in input', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'Test Project');

      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledTimes(12);
    });

    it('should call onChange with correct event', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'A');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'A',
          }),
        })
      );
    });

    it('should call onChange when clearing input', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'Test');
      await user.clear(input);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onChange for each keystroke', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'ABC');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('search status - Idle', () => {
    it('should display idle status in screen reader text when status is idle', () => {
      render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="idle"
        />
      );

      const statusText = screen.getByText('Idle');
      expect(statusText).toBeInTheDocument();
      expect(statusText).toHaveAttribute('aria-live', 'polite');
    });

    it('should hide loader icon when status is idle', () => {
      const { container } = render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="idle"
        />
      );

      const loader = container.querySelector('.animate-spin');
      expect(loader).not.toBeInTheDocument();
    });

    it('should set loader aria-hidden to true when status is idle', () => {
      const { container } = render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="idle"
        />
      );

      const loaders = container.querySelectorAll('[aria-hidden="true"]');
      expect(loaders.length).toBeGreaterThan(0);
    });
  });

  describe('search status - Loading', () => {
    it('should display searching status in screen reader text when status is loading', () => {
      render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="loading"
        />
      );

      const statusText = screen.getByText('Searching...');
      expect(statusText).toBeInTheDocument();
    });

    it('should show loader icon with animation when status is loading', () => {
      const { container } = render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="loading"
        />
      );

      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('should set loader aria-hidden to false when status is loading', () => {
      const { container } = render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="loading"
        />
      );

      const loader = container.querySelector('.animate-spin');
      expect(loader).toHaveAttribute('aria-hidden', 'false');
    });

    it('should apply block class to loader when status is loading', () => {
      const { container } = render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="loading"
        />
      );

      const loader = container.querySelector('.block');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('search status - Searching', () => {
    it('should display searching status when status is searching', () => {
      render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="searching"
        />
      );

      const statusText = screen.getByText('Searching...');
      expect(statusText).toBeInTheDocument();
    });

    it('should show loader when status is searching', () => {
      const { container } = render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="searching"
        />
      );

      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should associate label with input using htmlFor', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const label = screen.getByText('Search projects');
      expect(label).toHaveAttribute('for', 'project-search');
    });

    it('should have aria-describedby pointing to status element', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-describedby', 'search-status');
    });

    it('should have status element with correct id', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const status = screen.getByText('Idle');
      expect(status).toHaveAttribute('id', 'search-status');
    });

    it('should have status element with aria-live for screen readers', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const status = screen.getByText('Idle');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should have sr-only class on status for visual hiding', () => {
      render(<ProjectSearchField {...defaultProps} />);

      const status = screen.getByText('Idle');
      expect(status).toHaveClass('sr-only');
    });

    it('should be accessible via label click', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const label = screen.getByText('Search projects');
      await user.click(label);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveFocus();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string input', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      await user.clear(input);

      expect(mockOnChange).toHaveBeenCalledTimes(0);
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '!@#$%');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle numeric input', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '12345');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle rapid typing', async () => {
      const user = userEvent.setup();
      render(<ProjectSearchField {...defaultProps} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'Quick Brown Fox');

      expect(mockOnChange).toHaveBeenCalledTimes(15);
    });

    it('should handle status transition from idle to loading', () => {
      const { rerender } = render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="idle"
        />
      );
      expect(screen.getByText('Idle')).toBeInTheDocument();

      rerender(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="loading"
        />
      );
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    it('should handle status transition from loading to idle', () => {
      const { rerender } = render(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="loading"
        />
      );
      expect(screen.getByText('Searching...')).toBeInTheDocument();

      rerender(
        <ProjectSearchField
          {...defaultProps}
          searchStatus="idle"
        />
      );
      expect(screen.getByText('Idle')).toBeInTheDocument();
    });
  });
});
