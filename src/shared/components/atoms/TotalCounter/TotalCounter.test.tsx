import { render, screen } from '@testing-library/react';
import type { LucideIcon } from 'lucide-react';
import { forwardRef, Ref } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  const setup = (props?: Partial<React.ComponentProps<typeof TotalCounter>>) => {
    const defaultProps = {
      totalCount: 1,
      icon: MockIcon,
      ...props,
    };
    render(<TotalCounter {...defaultProps} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders singular label for count 1', () => {
      setup({ totalCount: 1 });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('1 task');
    });

    it.each([
      { totalCount: 0, expected: '0 tasks' },
      { totalCount: 2, expected: '2 tasks' },
      { totalCount: 5, expected: '5 tasks' },
    ])('renders plural label for count $totalCount', ({ totalCount, expected }) => {
      setup({ totalCount });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent(expected);
    });
  });

  describe('custom label', () => {
    it('renders singular custom label for count 1', () => {
      setup({ totalCount: 1, label: 'project' });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('1 project');
    });

    it.each([
      { totalCount: 0, expected: '0 projects' },
      { totalCount: 3, expected: '3 projects' },
    ])('renders pluralized custom label for count $totalCount', ({ totalCount, expected }) => {
      setup({ totalCount, label: 'project' });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent(expected);
    });
  });

  describe('icon rendering', () => {
    it('renders provided icon', () => {
      setup({ totalCount: 5 });
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('renders icon with correct size', () => {
      setup();
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveAttribute('data-size', '16');
    });

    it('hides icon from assistive technologies', () => {
      setup();
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('accessibility', () => {
    it('has aria-live="polite"', () => {
      const { container } = render(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );
      expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
    });

    it('updates label text when count changes', () => {
      const { rerender } = render(
        <TotalCounter
          totalCount={3}
          icon={MockIcon}
        />
      );
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
      { totalCount: 0, expected: 'tasks' },
      { totalCount: 1, expected: 'task' },
      { totalCount: 2, expected: 'tasks' },
    ])('uses correct pluralization for count $totalCount', ({ totalCount, expected }) => {
      setup({ totalCount });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent(`${totalCount} ${expected}`);
    });

    it.each([
      { totalCount: 0, label: 'item', expected: 'items' },
      { totalCount: 1, label: 'item', expected: 'item' },
      { totalCount: 2, label: 'item', expected: 'items' },
    ])('pluralizes custom label "$label" correctly', ({ totalCount, label, expected }) => {
      setup({ totalCount, label });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent(`${totalCount} ${expected}`);
    });
  });

  describe('memoization', () => {
    it('has correct displayName', () => {
      expect(TotalCounter.displayName).toBe('TotalCounter');
    });

    it('renders stable output when props do not change', () => {
      const { rerender } = render(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );
      rerender(
        <TotalCounter
          totalCount={5}
          icon={MockIcon}
        />
      );
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('5 tasks');
    });
  });

  describe('edge cases', () => {
    it('handles very large numbers', () => {
      setup({ totalCount: 9999 });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('9999 tasks');
    });

    it('handles label with special characters', () => {
      setup({ totalCount: 2, label: 'to-do' });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('2 to-dos');
    });
  });

  describe('different icon components', () => {
    it('supports alternate icons', () => {
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
