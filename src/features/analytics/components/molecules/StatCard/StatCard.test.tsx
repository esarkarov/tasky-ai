import { StatCard } from '@/features/analytics/components/molecules/StatCard/StatCard';
import { StatMetric } from '@/features/analytics/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/analytics/constants', () => ({
  ICON_MAP: {
    'check-circle': vi.fn(() => <div data-testid="check-circle-icon" />),
    clock: vi.fn(() => <div data-testid="clock-icon" />),
    target: vi.fn(() => <div data-testid="target-icon" />),
  },
}));

vi.mock('lucide-react', () => ({
  ListTodo: vi.fn(() => <div data-testid="list-todo-icon" />),
}));

describe('StatCard', () => {
  const mockMetric: StatMetric = {
    title: 'Total Tasks',
    value: '42',
    icon: 'check-circle',
    change: '+12% from last month',
  };

  describe('metric display', () => {
    it('should display metric title when rendered', () => {
      render(<StatCard metric={mockMetric} />);

      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    it('should display metric value when rendered', () => {
      render(<StatCard metric={mockMetric} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display metric change when rendered', () => {
      render(<StatCard metric={mockMetric} />);

      expect(screen.getByText('+12% from last month')).toBeInTheDocument();
    });
  });

  describe('different metric data', () => {
    it('should display different metric values when provided', () => {
      const differentMetric: StatMetric = {
        title: 'Completed Tasks',
        value: '28',
        icon: 'clock',
        change: '+5% from last month',
      };

      render(<StatCard metric={differentMetric} />);

      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
      expect(screen.getByText('+5% from last month')).toBeInTheDocument();
    });

    it('should display metric with zero value when provided', () => {
      const zeroMetric: StatMetric = {
        title: 'Pending Tasks',
        value: '0',
        icon: 'target',
        change: 'No change',
      };

      render(<StatCard metric={zeroMetric} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display metric with negative change when provided', () => {
      const negativeChangeMetric: StatMetric = {
        title: 'Overdue Tasks',
        value: '5',
        icon: 'clock',
        change: '-3% from last month',
      };

      render(<StatCard metric={negativeChangeMetric} />);

      expect(screen.getByText('-3% from last month')).toBeInTheDocument();
    });
  });

  describe('icon rendering', () => {
    it('should render mapped icon when valid icon key is provided', () => {
      render(<StatCard metric={mockMetric} />);

      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('should render different icon when different icon key is provided', () => {
      const metricWithDifferentIcon: StatMetric = {
        title: 'In Progress',
        value: '15',
        icon: 'clock',
        change: '+2% from last month',
      };

      render(<StatCard metric={metricWithDifferentIcon} />);

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('should render fallback icon when invalid icon key is provided', () => {
      const metricWithInvalidIcon: StatMetric = {
        title: 'Unknown',
        value: '10',
        icon: 'invalid-icon' as StatMetric['icon'],
        change: 'No change',
      };

      render(<StatCard metric={metricWithInvalidIcon} />);

      expect(screen.getByTestId('list-todo-icon')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render all metric components simultaneously when provided with data', () => {
      render(<StatCard metric={mockMetric} />);

      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('+12% from last month')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with typical data', () => {
      const { container } = render(<StatCard metric={mockMetric} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with animation class', () => {
      const { container } = render(
        <StatCard
          metric={mockMetric}
          animationClass="fade-in"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
