import { ProjectProgressChart } from '@/features/analytics/components/organisms/ProjectProgressChart/ProjectProgressChart';
import { ProjectProgress } from '@/features/analytics/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/analytics/constants', () => ({
  PROJECT_PROGRESS_CONFIG: {
    progress: {
      label: 'Progress',
      color: 'hsl(var(--chart-1))',
    },
  },
}));

vi.mock('recharts', () => ({
  Bar: vi.fn(() => null),
  BarChart: vi.fn(() => null),
  LabelList: vi.fn(() => null),
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
  CardFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ProjectProgressChart', () => {
  const mockData: ProjectProgress[] = [
    { project: 'Website Redesign', progress: 75, fill: 'var(--color-websiteRedesign)' },
    { project: 'Mobile App', progress: 50, fill: 'var(--color-mobileApp)' },
    { project: 'API Development', progress: 90, fill: 'var(--color-apiDevelopment)' },
  ];

  describe('header display', () => {
    it('should display chart title when rendered', () => {
      render(<ProjectProgressChart data={mockData} />);

      expect(screen.getByRole('heading', { name: 'Project Progress' })).toBeInTheDocument();
    });

    it('should display chart description when rendered', () => {
      render(<ProjectProgressChart data={mockData} />);

      expect(screen.getByText('Completion percentage by project')).toBeInTheDocument();
    });
  });

  describe('chart rendering', () => {
    it('should render chart container when rendered', () => {
      render(<ProjectProgressChart data={mockData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with empty data when provided', () => {
      render(<ProjectProgressChart data={[]} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render chart with single project when provided', () => {
      const singleProject: ProjectProgress[] = [
        { project: 'Single Project', progress: 100, fill: 'var(--color-single)' },
      ];

      render(<ProjectProgressChart data={singleProject} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('data variations', () => {
    it('should render with multiple projects when provided', () => {
      const multipleProjects: ProjectProgress[] = [
        { project: 'Project A', progress: 25, fill: 'var(--color-a)' },
        { project: 'Project B', progress: 50, fill: 'var(--color-b)' },
        { project: 'Project C', progress: 75, fill: 'var(--color-c)' },
        { project: 'Project D', progress: 100, fill: 'var(--color-d)' },
      ];

      render(<ProjectProgressChart data={multipleProjects} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render with zero progress project when provided', () => {
      const zeroProgressData: ProjectProgress[] = [
        { project: 'Not Started', progress: 0, fill: 'var(--color-notStarted)' },
      ];

      render(<ProjectProgressChart data={zeroProgressData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should render with completed project when provided', () => {
      const completedData: ProjectProgress[] = [
        { project: 'Completed Project', progress: 100, fill: 'var(--color-completed)' },
      ];

      render(<ProjectProgressChart data={completedData} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render header and chart simultaneously when provided with data', () => {
      render(<ProjectProgressChart data={mockData} />);

      expect(screen.getByRole('heading', { name: 'Project Progress' })).toBeInTheDocument();
      expect(screen.getByText('Completion percentage by project')).toBeInTheDocument();
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with typical data', () => {
      const { container } = render(<ProjectProgressChart data={mockData} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with animation class', () => {
      const { container } = render(
        <ProjectProgressChart
          data={mockData}
          animationClass="fade-in"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with empty data', () => {
      const { container } = render(<ProjectProgressChart data={[]} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
