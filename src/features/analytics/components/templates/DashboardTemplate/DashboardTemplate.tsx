import { DashboardHeader } from '@/features/analytics/components/molecules/DashboardHeader/DashboardHeader';
import { TimeRangeSelector } from '@/features/analytics/components/molecules/TimeRangeSelector/TimeRangeSelector';
import { ProjectProgressChart } from '@/features/analytics/components/organisms/ProjectProgressChart/ProjectProgressChart';
import { StatsGrid } from '@/features/analytics/components/organisms/StatsGrid/StatsGrid';
import { TaskCompletionChart } from '@/features/analytics/components/organisms/TaskCompletionChart/TaskCompletionChart';
import { TaskDistributionChart } from '@/features/analytics/components/organisms/TaskDistributionChart/TaskDistributionChart';
import { WeeklyActivityChart } from '@/features/analytics/components/organisms/WeeklyActivityChart/WeeklyActivityChart';
import type {
  ActivityData,
  ProjectProgress,
  StatMetric,
  TaskCompletionData,
  TaskDistribution,
  TimeRange,
} from '@/features/analytics/types';

interface DashboardTemplateProps {
  statMetrics: StatMetric[];
  taskCompletionData: TaskCompletionData[];
  taskDistributionData: TaskDistribution[];
  projectProgressData: ProjectProgress[];
  activityData: ActivityData[];
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  title: string;
  description: string;
}

export const DashboardTemplate = ({
  statMetrics,
  taskCompletionData,
  taskDistributionData,
  projectProgressData,
  activityData,
  selectedTimeRange,
  onTimeRangeChange,
  title,
  description,
}: DashboardTemplateProps) => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-10 animate-slide-in">
        <div className="flex items-center justify-between">
          <DashboardHeader
            title={title}
            description={description}
          />
          <TimeRangeSelector
            selectedRange={selectedTimeRange}
            onRangeChange={onTimeRangeChange}
          />
        </div>
      </div>
      <StatsGrid metrics={statMetrics} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <TaskCompletionChart
          data={taskCompletionData}
          animationClass="animate-slide-in stagger-5"
        />
        <TaskDistributionChart
          data={taskDistributionData}
          animationClass="animate-slide-in stagger-6"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProjectProgressChart
          data={projectProgressData}
          animationClass="animate-slide-in stagger-5"
        />
        <WeeklyActivityChart
          data={activityData}
          animationClass="animate-slide-in stagger-6"
        />
      </div>
    </div>
  );
};
