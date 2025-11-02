import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppBarTitle } from './AppBarTitle';

describe('AppBarTitle', () => {
  describe('basic rendering', () => {
    it('should render title', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={5}
          isVisible={true}
          label="task"
        />
      );

      expect(screen.getByRole('heading', { name: 'My Tasks' })).toBeInTheDocument();
    });

    it('should have correct heading id', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={5}
          isVisible={true}
          label="task"
        />
      );

      const heading = screen.getByRole('heading', { name: 'My Tasks' });
      expect(heading).toHaveAttribute('id', 'top-app-bar-title');
    });
  });

  describe('count display', () => {
    it('should show count with singular label when count is 1', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={1}
          isVisible={true}
          label="task"
        />
      );

      expect(screen.getByText('1 task')).toBeInTheDocument();
    });

    it('should show count with plural label when count is greater than 1', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={5}
          isVisible={true}
          label="task"
        />
      );

      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });

    it('should show count with plural label when count is 0', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={0}
          isVisible={true}
          label="task"
        />
      );

      expect(screen.queryByText(/task/)).not.toBeInTheDocument();
    });

    it('should not render count when totalCount is 0', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={0}
          isVisible={true}
          label="task"
        />
      );

      expect(screen.queryByText('0 tasks')).not.toBeInTheDocument();
    });

    it('should handle different labels correctly', () => {
      render(
        <AppBarTitle
          title="Projects"
          totalCount={3}
          isVisible={true}
          label="project"
        />
      );

      expect(screen.getByText('3 projects')).toBeInTheDocument();
    });
  });

  describe('visibility state', () => {
    it('should have visible classes when isVisible is true', () => {
      const { container } = render(
        <AppBarTitle
          title="My Tasks"
          totalCount={5}
          isVisible={true}
          label="task"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('translate-y-0', 'opacity-100');
    });

    it('should have hidden classes when isVisible is false', () => {
      const { container } = render(
        <AppBarTitle
          title="My Tasks"
          totalCount={5}
          isVisible={false}
          label="task"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('translate-y-5', 'opacity-0');
    });

    it('should still render content when not visible', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={5}
          isVisible={false}
          label="task"
        />
      );

      expect(screen.getByRole('heading', { name: 'My Tasks' })).toBeInTheDocument();
      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-live on count display', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={5}
          isVisible={true}
          label="task"
        />
      );

      const countElement = screen.getByText('5 tasks');
      expect(countElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should not have aria-live when count is 0', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={0}
          isVisible={true}
          label="task"
        />
      );

      const elements = document.querySelectorAll('[aria-live]');
      expect(elements.length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle large counts', () => {
      render(
        <AppBarTitle
          title="My Tasks"
          totalCount={999}
          isVisible={true}
          label="task"
        />
      );

      expect(screen.getByText('999 tasks')).toBeInTheDocument();
    });

    it('should handle empty string title', () => {
      render(
        <AppBarTitle
          title=""
          totalCount={5}
          isVisible={true}
          label="task"
        />
      );

      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('5 tasks')).toBeInTheDocument();
    });
  });
});
