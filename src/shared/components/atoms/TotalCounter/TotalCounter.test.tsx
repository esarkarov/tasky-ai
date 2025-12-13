import { TotalCounter } from '@/shared/components/atoms/TotalCounter/TotalCounter';
import { render, screen } from '@testing-library/react';
import type { LucideIcon } from 'lucide-react';
import { forwardRef, Ref } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const MockIcon: LucideIcon = forwardRef((props, ref) => (
  <svg
    ref={ref as Ref<SVGSVGElement>}
    data-testid="mock-icon"
    data-size={props.size}
    aria-hidden="true"
  />
));
MockIcon.displayName = 'MockIcon';

const AnotherIcon: LucideIcon = forwardRef((props, ref) => (
  <svg
    ref={ref as Ref<SVGSVGElement>}
    data-testid="another-icon"
    data-size={props.size}
  />
));
AnotherIcon.displayName = 'AnotherIcon';

interface RenderOptions {
  totalCount?: number;
  icon?: LucideIcon;
  label?: string;
}

const renderComponent = ({ totalCount = 1, icon = MockIcon, label }: RenderOptions = {}) =>
  render(
    <TotalCounter
      totalCount={totalCount}
      icon={icon}
      label={label}
    />
  );

describe('TotalCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering and pluralization', () => {
    it('should render singular label for count of 1', () => {
      renderComponent({ totalCount: 1 });

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('1 task');
    });

    it.each([
      { totalCount: 0, expected: '0 tasks' },
      { totalCount: 2, expected: '2 tasks' },
      { totalCount: 5, expected: '5 tasks' },
      { totalCount: 9999, expected: '9999 tasks' },
    ])('should render plural label for count $totalCount', ({ totalCount, expected }) => {
      renderComponent({ totalCount });

      expect(screen.getByTestId('total-count-label')).toHaveTextContent(expected);
    });

    it('should render custom label with correct pluralization', () => {
      const { rerender } = renderComponent({ totalCount: 1, label: 'project' });
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('1 project');

      rerender(
        <TotalCounter
          totalCount={0}
          icon={MockIcon}
          label="project"
        />
      );
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('0 projects');

      rerender(
        <TotalCounter
          totalCount={3}
          icon={MockIcon}
          label="project"
        />
      );
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('3 projects');
    });

    it('should handle label with special characters', () => {
      renderComponent({ totalCount: 2, label: 'to-do' });

      expect(screen.getByTestId('total-count-label')).toHaveTextContent('2 to-dos');
    });
  });

  describe('icon rendering', () => {
    it('should render icon with correct size and aria-hidden attribute', () => {
      renderComponent({ totalCount: 5 });

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-size', '16');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support alternate icon components', () => {
      renderComponent({ totalCount: 3, icon: AnotherIcon });

      expect(screen.getByTestId('another-icon')).toBeInTheDocument();
      expect(screen.getByTestId('total-count-label')).toHaveTextContent('3 tasks');
    });
  });

  describe('accessibility', () => {
    it('should have aria-live="polite" attribute', () => {
      const { container } = renderComponent({ totalCount: 5 });

      expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
    });

    it('should update label text when count changes', () => {
      const { rerender } = renderComponent({ totalCount: 3 });
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

  describe('component metadata', () => {
    it('should have correct displayName', () => {
      expect(TotalCounter.displayName).toBe('TotalCounter');
    });
  });
});
