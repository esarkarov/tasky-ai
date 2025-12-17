import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { ActivityData } from '@/features/analytics/types';

vi.mock('@/features/analytics/constants', () => ({
  WEEKLY_ACTIVITY_CONFIG: {
    tasks: {
      label: 'Tasks',
      color: 'hsl(var(--primary))',
    },
  },
}));

vi.mock('recharts', () => ({
  CartesianGrid: vi.fn(() => null),
  Line: vi.fn(() => null),
  LineChart: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
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
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('@/features/analytics/components/atoms/ActivityInfoFooter/ActivityInfoFooter', () => ({
  ActivityInfoFooter: ({ averageTasks, bestDay }: { averageTasks: string; bestDay: ActivityData }) => (
    <div data-testid="activity-info-footer">
      Average: {averageTasks} - Best: {bestDay.day} ({bestDay.tasks})
    </div>
  ),
}));

describe('WeeklyActivityChart', () => {
  const mockData: ActivityData[] = [
    { day: 'Monday', tasks: 10 },
    { day: 'Tuesday', tasks: 15 },
    { day: 'Wednesday', tasks: 12 },
    { day: 'Thursday', tasks: 20 },
    { day: 'Friday', tasks: 8 },
    { day: 'Saturday', tasks: 5 },
    { day: 'Sunday', tasks: 6 },
  ];

  describe('header display', () => {
    it('should display chart title when rendered', () => {
      render(<WeeklyActivityChart data={mockData} />);

      expect(screen.getByRole('heading', { name: 'Weekly Activity' })).toBeInTheDocument();
    });

    it('should display chart description when rendered', () => {
      render(<WeeklyActivityChart data={mockData} />);

      expect(screen.getByText('Tasks completed per day')).toBeInTheDocument();
    });
  });

  describe('chart rendering', () => {
    it('should render chart container when rendered', () => {
      render(<WeeklyActivityChart data={mockData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with single day when provided', () => {
      const singleDay: ActivityData[] = [{ day: 'Monday', tasks: 10 }];

      render(<WeeklyActivityChart data={singleDay} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with multiple days when provided', () => {
      render(<WeeklyActivityChart data={mockData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('activity info footer', () => {
    it('should render activity info footer when rendered', () => {
      render(<WeeklyActivityChart data={mockData} />);

      expect(screen.getByTestId('activity-info-footer')).toBeInTheDocument();
    });

    it('should calculate and display correct average tasks when rendered', () => {
      render(<WeeklyActivityChart data={mockData} />);

      const footer = screen.getByTestId('activity-info-footer');

      expect(footer).toHaveTextContent('Average: 10.9');
    });

    it('should identify and display most productive day when rendered', () => {
      render(<WeeklyActivityChart data={mockData} />);

      const footer = screen.getByTestId('activity-info-footer');
      expect(footer).toHaveTextContent('Best: Thursday (20)');
    });

    it('should calculate average for single day when provided', () => {
      const singleDay: ActivityData[] = [{ day: 'Monday', tasks: 10 }];

      render(<WeeklyActivityChart data={singleDay} />);

      const footer = screen.getByTestId('activity-info-footer');
      expect(footer).toHaveTextContent('Average: 10.0');
      expect(footer).toHaveTextContent('Best: Monday (10)');
    });

    it('should handle zero tasks when provided', () => {
      const zeroData: ActivityData[] = [
        { day: 'Monday', tasks: 0 },
        { day: 'Tuesday', tasks: 0 },
      ];

      render(<WeeklyActivityChart data={zeroData} />);

      const footer = screen.getByTestId('activity-info-footer');
      expect(footer).toHaveTextContent('Average: 0.0');
    });

    it('should identify first day as best when all days have same tasks', () => {
      const sameTasksData: ActivityData[] = [
        { day: 'Monday', tasks: 10 },
        { day: 'Tuesday', tasks: 10 },
        { day: 'Wednesday', tasks: 10 },
      ];

      render(<WeeklyActivityChart data={sameTasksData} />);

      const footer = screen.getByTestId('activity-info-footer');
      expect(footer).toHaveTextContent('Best: Monday (10)');
    });
  });

  describe('data variations', () => {
    it('should render with large task numbers when provided', () => {
      const largeData: ActivityData[] = [
        { day: 'Monday', tasks: 999 },
        { day: 'Tuesday', tasks: 1000 },
      ];

      render(<WeeklyActivityChart data={largeData} />);

      const footer = screen.getByTestId('activity-info-footer');
      expect(footer).toHaveTextContent('Average: 999.5');
      expect(footer).toHaveTextContent('Best: Tuesday (1000)');
    });

    it('should handle partial week data when provided', () => {
      const partialWeek: ActivityData[] = [
        { day: 'Monday', tasks: 10 },
        { day: 'Tuesday', tasks: 15 },
        { day: 'Wednesday', tasks: 12 },
      ];

      render(<WeeklyActivityChart data={partialWeek} />);

      const footer = screen.getByTestId('activity-info-footer');
      expect(footer).toHaveTextContent('Average: 12.3');
      expect(footer).toHaveTextContent('Best: Tuesday (15)');
    });
  });

  describe('component structure', () => {
    it('should render header chart and footer simultaneously when provided with data', () => {
      render(<WeeklyActivityChart data={mockData} />);

      expect(screen.getByRole('heading', { name: 'Weekly Activity' })).toBeInTheDocument();
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('activity-info-footer')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with full week data', () => {
      const { container } = render(<WeeklyActivityChart data={mockData} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with animation class', () => {
      const { container } = render(
        <WeeklyActivityChart
          data={mockData}
          animationClass="fade-in"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with single day', () => {
      const singleDay: ActivityData[] = [{ day: 'Monday', tasks: 10 }];

      const { container } = render(<WeeklyActivityChart data={singleDay} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
