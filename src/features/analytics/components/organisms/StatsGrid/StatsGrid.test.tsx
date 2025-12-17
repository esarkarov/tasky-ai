import { StatsGrid } from '@/features/analytics/components/organisms/StatsGrid/StatsGrid';
import { StatMetric } from '@/features/analytics/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/analytics/components/molecules/StatCard/StatCard', () => ({
  StatCard: ({ metric, animationClass }: { metric: StatMetric; animationClass?: string }) => (
    <div
      data-testid={`stat-card-${metric.title}`}
      data-animation-class={animationClass}>
      {metric.title}
    </div>
  ),
}));

describe('StatsGrid', () => {
  const mockMetrics: StatMetric[] = [
    { title: 'Total Tasks', value: '42', icon: 'check-circle', change: '+12%' },
    { title: 'Completed', value: '28', icon: 'check', change: '+5%' },
    { title: 'In Progress', value: '10', icon: 'clock', change: '+2%' },
    { title: 'Overdue', value: '4', icon: 'alert', change: '-1%' },
  ];

  describe('metric cards rendering', () => {
    it('should render all stat cards when provided with metrics', () => {
      render(<StatsGrid metrics={mockMetrics} />);

      expect(screen.getByTestId('stat-card-Total Tasks')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-Completed')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-In Progress')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-Overdue')).toBeInTheDocument();
    });

    it('should render correct number of cards when provided with metrics', () => {
      render(<StatsGrid metrics={mockMetrics} />);

      const cards = screen.getAllByTestId(/^stat-card-/);
      expect(cards).toHaveLength(4);
    });

    it('should render no cards when provided with empty metrics', () => {
      render(<StatsGrid metrics={[]} />);

      const cards = screen.queryAllByTestId(/^stat-card-/);
      expect(cards).toHaveLength(0);
    });

    it('should render single card when provided with one metric', () => {
      const singleMetric: StatMetric[] = [{ title: 'Total Tasks', value: '42', icon: 'check-circle', change: '+12%' }];

      render(<StatsGrid metrics={singleMetric} />);

      expect(screen.getByTestId('stat-card-Total Tasks')).toBeInTheDocument();
      const cards = screen.getAllByTestId(/^stat-card-/);
      expect(cards).toHaveLength(1);
    });
  });

  describe('metric data variations', () => {
    it('should render with different metric values when provided', () => {
      const differentMetrics: StatMetric[] = [
        { title: 'New Metric', value: '100', icon: 'star', change: '+50%' },
        { title: 'Another Metric', value: '0', icon: 'circle', change: '0%' },
      ];

      render(<StatsGrid metrics={differentMetrics} />);

      expect(screen.getByTestId('stat-card-New Metric')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-Another Metric')).toBeInTheDocument();
    });

    it('should handle metrics with special characters in titles when provided', () => {
      const specialMetrics: StatMetric[] = [
        { title: 'Tasks (High Priority)', value: '10', icon: 'alert', change: '+5%' },
        { title: 'Tasks - Low Priority', value: '20', icon: 'info', change: '+2%' },
      ];

      render(<StatsGrid metrics={specialMetrics} />);

      expect(screen.getByTestId('stat-card-Tasks (High Priority)')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-Tasks - Low Priority')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render grid container when provided with metrics', () => {
      const { container } = render(<StatsGrid metrics={mockMetrics} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render grid container even with empty metrics', () => {
      const { container } = render(<StatsGrid metrics={[]} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with typical metrics', () => {
      const { container } = render(<StatsGrid metrics={mockMetrics} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with empty metrics', () => {
      const { container } = render(<StatsGrid metrics={[]} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
