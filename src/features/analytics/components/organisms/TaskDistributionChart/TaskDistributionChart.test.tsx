import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskDistributionChart } from './TaskDistributionChart';
import { TaskDistribution } from '@/features/analytics/types';

vi.mock('recharts', () => ({
  Label: vi.fn(() => null),
  Pie: vi.fn(() => null),
  PieChart: vi.fn(() => null),
  ResponsiveContainer: vi.fn(({ children }) => children),
}));

vi.mock('@/shared/components/ui/chart', () => ({
  ChartContainer: vi.fn(({ children }) => <div data-testid="chart-container">{children}</div>),
  ChartTooltip: vi.fn(() => null),
  ChartTooltipContent: vi.fn(() => null),
}));

vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('@/features/analytics/components/atoms/ChartCenterLabel/ChartCenterLabel', () => ({
  ChartCenterLabel: vi.fn(() => null),
}));

describe('TaskDistributionChart', () => {
  const mockData: TaskDistribution[] = [
    { category: 'Project A', label: 'Project A', tasks: 50, fill: 'var(--color-projectA)' },
    { category: 'Project B', label: 'Project B', tasks: 30, fill: 'var(--color-projectB)' },
    { category: 'Project C', label: 'Project C', tasks: 20, fill: 'var(--color-projectC)' },
  ];

  describe('header display', () => {
    it('should display chart title when rendered', () => {
      render(<TaskDistributionChart data={mockData} />);

      expect(screen.getByRole('heading', { name: 'Task Distribution' })).toBeInTheDocument();
    });

    it('should display chart description when rendered', () => {
      render(<TaskDistributionChart data={mockData} />);

      expect(screen.getByText('By top 5 project')).toBeInTheDocument();
    });
  });

  describe('footer display', () => {
    it('should display footer text when rendered', () => {
      render(<TaskDistributionChart data={mockData} />);

      expect(screen.getByText('Showing task breakdown by top 5 project')).toBeInTheDocument();
    });
  });

  describe('chart rendering', () => {
    it('should render chart container when rendered', () => {
      render(<TaskDistributionChart data={mockData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with empty data when provided', () => {
      render(<TaskDistributionChart data={[]} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with single category when provided', () => {
      const singleCategory: TaskDistribution[] = [
        { category: 'Project A', label: 'Project A', tasks: 100, fill: 'var(--color-projectA)' },
      ];

      render(<TaskDistributionChart data={singleCategory} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with five categories when provided', () => {
      const fiveCategories: TaskDistribution[] = [
        { category: 'Project A', label: 'Project A', tasks: 30, fill: 'var(--color-projectA)' },
        { category: 'Project B', label: 'Project B', tasks: 25, fill: 'var(--color-projectB)' },
        { category: 'Project C', label: 'Project C', tasks: 20, fill: 'var(--color-projectC)' },
        { category: 'Project D', label: 'Project D', tasks: 15, fill: 'var(--color-projectD)' },
        { category: 'Project E', label: 'Project E', tasks: 10, fill: 'var(--color-projectE)' },
      ];

      render(<TaskDistributionChart data={fiveCategories} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('data variations', () => {
    it('should render with zero tasks when provided', () => {
      const zeroData: TaskDistribution[] = [
        { category: 'Empty Project', label: 'Empty Project', tasks: 0, fill: 'var(--color-empty)' },
      ];

      render(<TaskDistributionChart data={zeroData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render with large task numbers when provided', () => {
      const largeData: TaskDistribution[] = [
        { category: 'Large Project', label: 'Large Project', tasks: 9999, fill: 'var(--color-large)' },
      ];

      render(<TaskDistributionChart data={largeData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render with mixed task numbers when provided', () => {
      const mixedData: TaskDistribution[] = [
        { category: 'Project A', label: 'Project A', tasks: 100, fill: 'var(--color-a)' },
        { category: 'Project B', label: 'Project B', tasks: 0, fill: 'var(--color-b)' },
        { category: 'Project C', label: 'Project C', tasks: 50, fill: 'var(--color-c)' },
      ];

      render(<TaskDistributionChart data={mixedData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render header chart and footer simultaneously when provided with data', () => {
      render(<TaskDistributionChart data={mockData} />);

      expect(screen.getByRole('heading', { name: 'Task Distribution' })).toBeInTheDocument();
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByText('Showing task breakdown by top 5 project')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with typical data', () => {
      const { container } = render(<TaskDistributionChart data={mockData} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with animation class', () => {
      const { container } = render(
        <TaskDistributionChart
          data={mockData}
          animationClass="fade-in"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with empty data', () => {
      const { container } = render(<TaskDistributionChart data={[]} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with five categories', () => {
      const fiveCategories: TaskDistribution[] = [
        { category: 'Project A', label: 'Project A', tasks: 30, fill: 'var(--color-projectA)' },
        { category: 'Project B', label: 'Project B', tasks: 25, fill: 'var(--color-projectB)' },
        { category: 'Project C', label: 'Project C', tasks: 20, fill: 'var(--color-projectC)' },
        { category: 'Project D', label: 'Project D', tasks: 15, fill: 'var(--color-projectD)' },
        { category: 'Project E', label: 'Project E', tasks: 10, fill: 'var(--color-projectE)' },
      ];

      const { container } = render(<TaskDistributionChart data={fiveCategories} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
