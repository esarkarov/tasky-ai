import { render, screen } from '@testing-library/react';
import type { LucideIcon } from 'lucide-react';
import { forwardRef, Ref } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TotalCounter } from './TotalCounter';

const MockIcon: LucideIcon = forwardRef((props, ref) => (
  <svg
    ref={ref as Ref<SVGSVGElement>}
    data-testid="mock-icon"
    data-size={props.size}
    aria-hidden="true"
  />
));
MockIcon.displayName = 'MockIcon';

describe('TotalCounter', () => {
  describe('rendering with default label', () => {
    it('should render with singular label when count is 1', () => {
      render(
        <TotalCounter
          totalCount={1}
          icon={MockIcon}
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('1 task');
    });

    it('should render with plural label when count is 0', () => {
      render(
        <TotalCounter
          totalCount={0}
          icon={MockIcon}
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('0 tasks');
    });

    it('should render with plural label when count is 2', () => {
      render(
        <TotalCounter
          totalCount={2}
          icon={MockIcon}
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('2 tasks');
    });

    it('should render with plural label when count is greater than 2', () => {
      render(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('5 tasks');
    });
  });

  describe('rendering with custom label', () => {
    it('should render with singular custom label when count is 1', () => {
      render(
        <TotalCounter
          totalCount={1}
          icon={MockIcon}
          label="project"
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('1 project');
    });

    it('should render with plural custom label when count is 0', () => {
      render(
        <TotalCounter
          totalCount={0}
          icon={MockIcon}
          label="project"
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('0 projects');
    });

    it('should render with plural custom label when count is greater than 1', () => {
      render(
        <TotalCounter
          totalCount={3}
          icon={MockIcon}
          label="item"
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('3 items');
    });
  });

  describe('icon rendering', () => {
    it('should render the provided icon', () => {
      render(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('should render icon with correct size', () => {
      render(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveAttribute('data-size', '16');
    });

    it('should hide icon from screen readers', () => {
      render(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('accessibility', () => {
    it('should have aria-live polite attribute', () => {
      const { container } = render(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce count changes to screen readers', () => {
      const { rerender, container } = render(
        <TotalCounter
          totalCount={3}
          icon={MockIcon}
        />
      );
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('3 tasks');

      rerender(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('5 tasks');
    });
  });

  describe('pluralization logic', () => {
    it.each([
      { count: 0, expected: 'tasks' },
      { count: 1, expected: 'task' },
      { count: 2, expected: 'tasks' },
      { count: 10, expected: 'tasks' },
      { count: 100, expected: 'tasks' },
    ])('should use correct pluralization for count $count', ({ count, expected }) => {
      render(
        <TotalCounter
          totalCount={count}
          icon={MockIcon}
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent(`${count} ${expected}`);
    });

    it.each([
      { count: 0, label: 'item', expected: 'items' },
      { count: 1, label: 'item', expected: 'item' },
      { count: 2, label: 'item', expected: 'items' },
    ])('should pluralize custom label "$label" correctly for count $count', ({ count, label, expected }) => {
      render(
        <TotalCounter
          totalCount={count}
          icon={MockIcon}
          label={label}
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent(`${count} ${expected}`);
    });
  });

  describe('memoization', () => {
    it('should have displayName for debugging', () => {
      expect(TotalCounter.displayName).toBe('TotalCounter');
    });

    it('should not re-render when props have not changed', () => {
      const renderSpy = vi.fn();
      const MemoizedCounter = () => {
        renderSpy();
        return (
          <TotalCounter
            totalCount={5}
            icon={MockIcon}
          />
        );
      };

      const { rerender } = render(<MemoizedCounter />);

      rerender(<MemoizedCounter />);

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('5 tasks');
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      render(
        <TotalCounter
          totalCount={9999}
          icon={MockIcon}
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('9999 tasks');
    });

    it('should handle label with special characters', () => {
      render(
        <TotalCounter
          totalCount={2}
          icon={MockIcon}
          label="to-do"
        />
      );

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('2 to-dos');
    });
  });

  describe('different icon components', () => {
    it('should work with different icon types', () => {
      const AnotherIcon: LucideIcon = forwardRef((props, ref) => (
        <svg
          ref={ref as Ref<SVGSVGElement>}
          data-testid="another-icon"
          aria-current="true"
          data-size={props.size}
        />
      ));
      AnotherIcon.displayName = 'AnotherIcon';

      render(
        <TotalCounter
          totalCount={3}
          icon={AnotherIcon}
        />
      );

      expect(screen.getByTestId('another-icon')).toBeInTheDocument();
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('3 tasks');
    });
  });
});
