export type TimeRange = '7d' | '30d' | '6m' | '1y';
export type TaskStatus = 'completed' | 'pending' | 'overdue';

export interface StatMetric {
  title: string;
  value: string;
  icon: string;
  change: string;
}

export interface TaskCompletionData {
  month: string;
  completed: number;
  pending: number;
  overdue: number;
}

export interface ProjectProgress {
  project: string;
  progress: number;
  fill: string;
}

export interface ActivityData {
  day: string;
  tasks: number;
}

export interface TaskDistribution {
  category: string;
  label?: string;
  tasks: number;
  fill: string;
}

export interface AnalyticsDashboardData {
  statMetrics: StatMetric[];
  taskCompletionData: TaskCompletionData[];
  taskDistributionData: TaskDistribution[];
  projectProgressData: ProjectProgress[];
  activityData: ActivityData[];
}
