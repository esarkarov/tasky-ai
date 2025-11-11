import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppBarTitle, AppBarTitleProps } from './AppBarTitle';

describe('AppBarTitle', () => {
  const renderComponent = (props?: Partial<AppBarTitleProps>) => {
    const defaultProps = {
      title: 'My Tasks',
      totalCount: 5,
      isVisible: true,
      label: 'task',
    };
    return render(
      <AppBarTitle
        {...defaultProps}
        {...props}
      />
    );
  };

  describe('rendering', () => {
    it('renders title correctly', () => {
      renderComponent();

      expect(screen.getByRole('heading', { name: /my tasks/i })).toBeInTheDocument();
    });

    it('assigns correct heading id', () => {
      renderComponent();

      expect(screen.getByRole('heading')).toHaveAttribute('id', 'top-app-bar-title');
    });
  });

  describe('count display', () => {
    it('shows singular label when count is 1', () => {
      renderComponent({ totalCount: 1 });

      expect(screen.getByText('1 task')).toBeInTheDocument();
    });

    it('shows plural label when count > 1', () => {
      renderComponent({ totalCount: 5 });
      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });

    it('does not render count when totalCount = 0', () => {
      renderComponent({ totalCount: 0 });
      expect(screen.queryByText(/task/)).not.toBeInTheDocument();
    });

    it('handles different labels correctly', () => {
      renderComponent({ title: 'Projects', totalCount: 3, label: 'project' });
      expect(screen.getByText('3 projects')).toBeInTheDocument();
    });
  });

  describe('visibility state', () => {
    it('applies visible classes when isVisible is true', () => {
      const { container } = renderComponent({ isVisible: true });

      expect(container.firstChild).toHaveClass('translate-y-0', 'opacity-100');
    });

    it('applies hidden classes when isVisible is false', () => {
      const { container } = renderComponent({ isVisible: false });

      expect(container.firstChild).toHaveClass('translate-y-5', 'opacity-0');
    });

    it('still renders content when not visible', () => {
      renderComponent({ isVisible: false });

      expect(screen.getByRole('heading', { name: /my tasks/i })).toBeInTheDocument();
      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('includes aria-live on count display when count > 0', () => {
      renderComponent({ totalCount: 5 });

      const countElement = screen.getByText('5 tasks');
      expect(countElement).toHaveAttribute('aria-live', 'polite');
    });

    it('does not include aria-live when count = 0', () => {
      renderComponent({ totalCount: 0 });

      expect(document.querySelectorAll('[aria-live]')).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('renders correctly for large counts', () => {
      renderComponent({ totalCount: 999 });
      expect(screen.getByText('999 tasks')).toBeInTheDocument();
    });

    it('handles empty title gracefully', () => {
      renderComponent({ title: '' });
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });

    it('renders correctly when totalCount = 0 but visible = false', () => {
      const { container } = renderComponent({ totalCount: 0, isVisible: false });
      expect(container.firstChild).toHaveClass('translate-y-5', 'opacity-0');
    });
  });
});
