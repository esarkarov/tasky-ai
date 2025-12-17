import { DashboardTemplate } from '@/features/analytics/components/templates/DashboardTemplate/DashboardTemplate';
import type {
  ActivityData,
  ProjectProgress,
  StatMetric,
  TaskCompletionData,
  TaskDistribution,
  TimeRange,
} from '@/features/analytics/types';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/analytics/components/molecules/DashboardHeader/DashboardHeader', () => ({
  DashboardHeader: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="dashboard-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/features/analytics/components/molecules/TimeRangeSelector/TimeRangeSelector', () => ({
  TimeRangeSelector: ({
    selectedRange,
    onRangeChange,
  }: {
    selectedRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
  }) => (
    <div data-testid="time-range-selector">
      <span>Selected: {selectedRange}</span>
      <button onClick={() => onRangeChange('30d')}>Change Range</button>
    </div>
  ),
}));

vi.mock('@/features/analytics/components/organisms/StatsGrid/StatsGrid', () => ({
  StatsGrid: ({ metrics }: { metrics: StatMetric[] }) => (
    <div data-testid="stats-grid">Stats Grid: {metrics.length} metrics</div>
  ),
}));

vi.mock('@/features/analytics/components/organisms/TaskCompletionChart/TaskCompletionChart', () => ({
  TaskCompletionChart: ({ data, animationClass }: { data: TaskCompletionData[]; animationClass?: string }) => (
    <div
      data-testid="task-completion-chart"
      data-animation={animationClass}>
      Task Completion: {data.length} months
    </div>
  ),
}));

vi.mock('@/features/analytics/components/organisms/TaskDistributionChart/TaskDistributionChart', () => ({
  TaskDistributionChart: ({ data, animationClass }: { data: TaskDistribution[]; animationClass?: string }) => (
    <div
      data-testid="task-distribution-chart"
      data-animation={animationClass}>
      Task Distribution: {data.length} categories
    </div>
  ),
}));

vi.mock('@/features/analytics/components/organisms/ProjectProgressChart/ProjectProgressChart', () => ({
  ProjectProgressChart: ({ data, animationClass }: { data: ProjectProgress[]; animationClass?: string }) => (
    <div
      data-testid="project-progress-chart"
      data-animation={animationClass}>
      Project Progress: {data.length} projects
    </div>
  ),
}));

vi.mock('@/features/analytics/components/organisms/WeeklyActivityChart/WeeklyActivityChart', () => ({
  WeeklyActivityChart: ({ data, animationClass }: { data: ActivityData[]; animationClass?: string }) => (
    <div
      data-testid="weekly-activity-chart"
      data-animation={animationClass}>
      Weekly Activity: {data.length} days
    </div>
  ),
}));

describe('DashboardTemplate', () => {
  const mockStatMetrics: StatMetric[] = [
    { title: 'Total Tasks', value: '42', icon: 'check', change: '+12%' },
    { title: 'Completed', value: '28', icon: 'check-circle', change: '+5%' },
  ];

  const mockTaskCompletionData: TaskCompletionData[] = [
    { month: 'January', completed: 50, pending: 20, overdue: 5 },
    { month: 'February', completed: 60, pending: 15, overdue: 3 },
  ];

  const mockTaskDistributionData: TaskDistribution[] = [
    { category: 'Project A', label: 'Project A', tasks: 50, fill: 'var(--color-a)' },
    { category: 'Project B', label: 'Project B', tasks: 30, fill: 'var(--color-b)' },
  ];

  const mockProjectProgressData: ProjectProgress[] = [
    { project: 'Website', progress: 75, fill: 'var(--color-website)' },
    { project: 'Mobile App', progress: 50, fill: 'var(--color-mobile)' },
  ];

  const mockActivityData: ActivityData[] = [
    { day: 'Monday', tasks: 10 },
    { day: 'Tuesday', tasks: 15 },
  ];

  const mockOnTimeRangeChange = vi.fn();

  const defaultProps = {
    statMetrics: mockStatMetrics,
    taskCompletionData: mockTaskCompletionData,
    taskDistributionData: mockTaskDistributionData,
    projectProgressData: mockProjectProgressData,
    activityData: mockActivityData,
    selectedTimeRange: '7d' as TimeRange,
    onTimeRangeChange: mockOnTimeRangeChange,
    title: 'Analytics Dashboard',
    description: 'View your performance metrics',
  };

  describe('header section', () => {
    it('should render dashboard header when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    it('should pass title to dashboard header when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    it('should pass description to dashboard header when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByText('View your performance metrics')).toBeInTheDocument();
    });

    it('should render time range selector when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
    });

    it('should display selected time range when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByText('Selected: 7d')).toBeInTheDocument();
    });
  });

  describe('stats grid section', () => {
    it('should render stats grid when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
    });

    it('should pass metrics to stats grid when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByText('Stats Grid: 2 metrics')).toBeInTheDocument();
    });
  });

  describe('chart sections', () => {
    it('should render task completion chart when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByTestId('task-completion-chart')).toBeInTheDocument();
    });

    it('should render task distribution chart when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByTestId('task-distribution-chart')).toBeInTheDocument();
    });

    it('should render project progress chart when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByTestId('project-progress-chart')).toBeInTheDocument();
    });

    it('should render weekly activity chart when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByTestId('weekly-activity-chart')).toBeInTheDocument();
    });
  });

  describe('data passing', () => {
    it('should pass task completion data to chart when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByText('Task Completion: 2 months')).toBeInTheDocument();
    });

    it('should pass task distribution data to chart when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByText('Task Distribution: 2 categories')).toBeInTheDocument();
    });

    it('should pass project progress data to chart when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByText('Project Progress: 2 projects')).toBeInTheDocument();
    });

    it('should pass activity data to chart when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByText('Weekly Activity: 2 days')).toBeInTheDocument();
    });
  });

  describe('time range interaction', () => {
    it('should call onTimeRangeChange when time range is changed', async () => {
      const user = userEvent.setup();
      render(<DashboardTemplate {...defaultProps} />);

      const changeButton = screen.getByRole('button', { name: 'Change Range' });
      await user.click(changeButton);

      expect(mockOnTimeRangeChange).toHaveBeenCalledTimes(1);
      expect(mockOnTimeRangeChange).toHaveBeenCalledWith('30d');
    });

    it('should render with different time range when provided', () => {
      render(
        <DashboardTemplate
          {...defaultProps}
          selectedTimeRange="30d"
        />
      );

      expect(screen.getByText('Selected: 30d')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render all sections simultaneously when rendered', () => {
      render(<DashboardTemplate {...defaultProps} />);

      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
      expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
      expect(screen.getByTestId('task-completion-chart')).toBeInTheDocument();
      expect(screen.getByTestId('task-distribution-chart')).toBeInTheDocument();
      expect(screen.getByTestId('project-progress-chart')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-activity-chart')).toBeInTheDocument();
    });
  });

  describe('empty data handling', () => {
    it('should render with empty metrics when provided', () => {
      render(
        <DashboardTemplate
          {...defaultProps}
          statMetrics={[]}
        />
      );

      expect(screen.getByText('Stats Grid: 0 metrics')).toBeInTheDocument();
    });

    it('should render with empty task completion data when provided', () => {
      render(
        <DashboardTemplate
          {...defaultProps}
          taskCompletionData={[]}
        />
      );

      expect(screen.getByText('Task Completion: 0 months')).toBeInTheDocument();
    });

    it('should render with empty task distribution data when provided', () => {
      render(
        <DashboardTemplate
          {...defaultProps}
          taskDistributionData={[]}
        />
      );

      expect(screen.getByText('Task Distribution: 0 categories')).toBeInTheDocument();
    });

    it('should render with empty project progress data when provided', () => {
      render(
        <DashboardTemplate
          {...defaultProps}
          projectProgressData={[]}
        />
      );

      expect(screen.getByText('Project Progress: 0 projects')).toBeInTheDocument();
    });

    it('should render with empty activity data when provided', () => {
      render(
        <DashboardTemplate
          {...defaultProps}
          activityData={[]}
        />
      );

      expect(screen.getByText('Weekly Activity: 0 days')).toBeInTheDocument();
    });
  });
});
