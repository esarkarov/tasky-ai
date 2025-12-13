import { AppBarTitle } from '@/shared/components/atoms/AppBarTitle/AppBarTitle';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AppBarTitle', () => {
  interface RenderOptions {
    title?: string;
    totalCount?: number;
    isVisible?: boolean;
    label?: string;
  }

  const renderComponent = ({
    title = 'My Tasks',
    totalCount = 5,
    isVisible = true,
    label = 'task',
  }: RenderOptions = {}) => {
    return render(
      <AppBarTitle
        title={title}
        totalCount={totalCount}
        isVisible={isVisible}
        label={label}
      />
    );
  };

  const getHeading = () => screen.getByRole('heading', { name: /my tasks/i });
  const getCount = (count: number, label: string) => screen.queryByText(`${count} ${label}`);

  describe('rendering', () => {
    it('should render title with correct heading id and count', () => {
      renderComponent();

      const heading = getHeading();
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'top-app-bar-title');
      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });
  });

  describe('count display', () => {
    it('should show singular label when count is 1', () => {
      renderComponent({ totalCount: 1 });

      expect(getCount(1, 'task')).toBeInTheDocument();
    });

    it('should show plural label when count is greater than 1', () => {
      renderComponent({ totalCount: 5 });

      expect(getCount(5, 'tasks')).toBeInTheDocument();
    });

    it('should not render count when totalCount is 0', () => {
      renderComponent({ totalCount: 0 });

      expect(screen.queryByText(/task/)).not.toBeInTheDocument();
    });

    it('should handle different labels with pluralization', () => {
      renderComponent({ title: 'Projects', totalCount: 3, label: 'project' });

      expect(screen.getByText('3 projects')).toBeInTheDocument();
    });
  });

  describe('visibility state', () => {
    it('should apply visible classes when isVisible is true', () => {
      const { container } = renderComponent({ isVisible: true });

      expect(container.firstChild).toHaveClass('translate-y-0', 'opacity-100');
    });

    it('should apply hidden classes and still render content when isVisible is false', () => {
      const { container } = renderComponent({ isVisible: false });

      expect(container.firstChild).toHaveClass('translate-y-5', 'opacity-0');
      expect(getHeading()).toBeInTheDocument();
      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should include aria-live on count display when count is greater than 0', () => {
      renderComponent({ totalCount: 5 });

      const countElement = screen.getByText('5 tasks');
      expect(countElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should not include aria-live when count is 0', () => {
      renderComponent({ totalCount: 0 });

      expect(document.querySelectorAll('[aria-live]')).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should render correctly for large counts', () => {
      renderComponent({ totalCount: 999 });

      expect(screen.getByText('999 tasks')).toBeInTheDocument();
    });

    it('should handle empty title gracefully', () => {
      renderComponent({ title: '' });

      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });

    it('should apply hidden classes when both totalCount is 0 and isVisible is false', () => {
      const { container } = renderComponent({ totalCount: 0, isVisible: false });

      expect(container.firstChild).toHaveClass('translate-y-5', 'opacity-0');
    });
  });
});
