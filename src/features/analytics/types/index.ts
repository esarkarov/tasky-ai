export type TimeRange = '7d' | '30d' | '6m' | '1y';
export type TrendDirection = 'up' | 'down';

export interface StatMetric {
  title: string;
  value: string;
  change: string;
  trend: TrendDirection;
  icon: string;
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

export interface ProductivityData {
  day: string;
  hours: number;
}

export interface TaskDistribution {
  category: string;
  tasks: number;
  fill: string;
}

export interface PerformanceMetric {
  metric: string;
  score: number;
}
