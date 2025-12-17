import { TaskCompletionChart } from '@/features/analytics/components/organisms/TaskCompletionChart/TaskCompletionChart';
import { TaskCompletionData } from '@/features/analytics/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/analytics/constants', () => ({
  TASK_COMPLETION_CONFIG: {
    completed: {
      label: 'Completed',
      color: 'hsl(var(--chart-1))',
    },
    pending: {
      label: 'Pending',
      color: 'hsl(var(--chart-2))',
    },
    overdue: {
      label: 'Overdue',
      color: 'hsl(var(--chart-3))',
    },
  },
}));

vi.mock('@/features/analytics/hooks/use-trend-info', () => ({
  useTrendInfo: vi.fn(() => ({
    isPositive: true,
    trend: 15,
    dateRange: 'Jan 2024 - Jun 2024',
  })),
}));

vi.mock('recharts', () => ({
  Area: vi.fn(() => null),
  AreaChart: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  ResponsiveContainer: vi.fn(({ children }) => children),
}));

vi.mock('@/shared/components/ui/chart', () => ({
  ChartContainer: vi.fn(({ children }) => <div data-testid="chart-container">{children}</div>),
  ChartLegend: vi.fn(() => null),
  ChartLegendContent: vi.fn(() => null),
  ChartTooltip: vi.fn(() => null),
  ChartTooltipContent: vi.fn(() => null),
}));

vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/features/analytics/components/atoms/TrendInfoFooter/TrendInfoFooter', () => ({
  TrendInfoFooter: ({ isPositive, trend, dateRange }: { isPositive: boolean; trend: number; dateRange: string }) => (
    <div data-testid="trend-info-footer">
      {isPositive ? 'Positive' : 'Negative'} - {trend}% - {dateRange}
    </div>
  ),
}));

describe('TaskCompletionChart', () => {
  const mockData: TaskCompletionData[] = [
    { month: 'January', completed: 50, pending: 20, overdue: 5 },
    { month: 'February', completed: 60, pending: 15, overdue: 3 },
    { month: 'March', completed: 70, pending: 10, overdue: 2 },
  ];

  describe('header display', () => {
    it('should display chart title when rendered', () => {
      render(<TaskCompletionChart data={mockData} />);

      expect(screen.getByRole('heading', { name: 'Task Completion Trends' })).toBeInTheDocument();
    });

    it('should display chart description when rendered', () => {
      render(<TaskCompletionChart data={mockData} />);

      expect(screen.getByText('Showing task status for the last 6 months')).toBeInTheDocument();
    });
  });

  describe('chart rendering', () => {
    it('should render chart container when rendered', () => {
      render(<TaskCompletionChart data={mockData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with empty data when provided', () => {
      render(<TaskCompletionChart data={[]} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with single month data when provided', () => {
      const singleMonth: TaskCompletionData[] = [{ month: 'January', completed: 50, pending: 20, overdue: 5 }];

      render(<TaskCompletionChart data={singleMonth} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('trend info footer', () => {
    it('should render trend info footer when rendered', () => {
      render(<TaskCompletionChart data={mockData} />);

      expect(screen.getByTestId('trend-info-footer')).toBeInTheDocument();
    });

    it('should pass trend data to footer when rendered', () => {
      render(<TaskCompletionChart data={mockData} />);

      const footer = screen.getByTestId('trend-info-footer');
      expect(footer).toHaveTextContent('Positive - 15% - Jan 2024 - Jun 2024');
    });

    it('should display negative trend when hook returns negative trend', async () => {
      const { useTrendInfo } = vi.mocked(await import('@/features/analytics/hooks/use-trend-info'));

      useTrendInfo.mockReturnValue({
        isPositive: false,
        trend: 10,
        dateRange: 'Jan 2024 - Jun 2024',
      });

      render(<TaskCompletionChart data={mockData} />);

      const footer = screen.getByTestId('trend-info-footer');
      expect(footer).toHaveTextContent('Negative - 10% - Jan 2024 - Jun 2024');
    });
  });

  describe('data variations', () => {
    it('should render with six months of data when provided', () => {
      const sixMonths: TaskCompletionData[] = [
        { month: 'January', completed: 50, pending: 20, overdue: 5 },
        { month: 'February', completed: 60, pending: 15, overdue: 3 },
        { month: 'March', completed: 70, pending: 10, overdue: 2 },
        { month: 'April', completed: 65, pending: 12, overdue: 4 },
        { month: 'May', completed: 75, pending: 8, overdue: 1 },
        { month: 'June', completed: 80, pending: 5, overdue: 0 },
      ];

      render(<TaskCompletionChart data={sixMonths} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render with zero values when provided', () => {
      const zeroData: TaskCompletionData[] = [{ month: 'January', completed: 0, pending: 0, overdue: 0 }];

      render(<TaskCompletionChart data={zeroData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render header chart and footer simultaneously when provided with data', () => {
      render(<TaskCompletionChart data={mockData} />);

      expect(screen.getByRole('heading', { name: 'Task Completion Trends' })).toBeInTheDocument();
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('trend-info-footer')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with typical data', () => {
      const { container } = render(<TaskCompletionChart data={mockData} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with animation class', () => {
      const { container } = render(
        <TaskCompletionChart
          data={mockData}
          animationClass="fade-in"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with empty data', () => {
      const { container } = render(<TaskCompletionChart data={[]} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
