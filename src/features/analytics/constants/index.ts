import {
  PerformanceMetric,
  ProductivityData,
  ProjectProgress,
  StatMetric,
  TaskCompletionData,
  TaskDistribution,
} from '@/features/analytics/types';
import { ChartConfig } from '@/shared/components/ui/chart';

export const TASK_COMPLETION_CONFIG = {
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
} satisfies ChartConfig;

export const PROJECT_PROGRESS_CONFIG = {
  progress: {
    label: 'Progress',
  },
  state: {
    label: 'State Management',
    color: 'hsl(var(--chart-1))',
  },
  frontend: {
    label: 'Frontend Architecture',
    color: 'hsl(var(--chart-2))',
  },
  system: {
    label: 'System Design',
    color: 'hsl(var(--chart-3))',
  },
  owasp: {
    label: 'OWASP Security',
    color: 'hsl(var(--chart-4))',
  },
  agile: {
    label: 'Agile Process',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export const PRODUCTIVITY_CONFIG = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export const TASK_DISTRIBUTION_CONFIG = {
  tasks: {
    label: 'Tasks',
  },
  development: {
    label: 'Development',
    color: 'hsl(var(--chart-1))',
  },
  learning: {
    label: 'Learning',
    color: 'hsl(var(--chart-2))',
  },
  design: {
    label: 'Design',
    color: 'hsl(var(--chart-3))',
  },
  planning: {
    label: 'Planning',
    color: 'hsl(var(--chart-4))',
  },
  review: {
    label: 'Review',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export const PERFORMANCE_CONFIG = {
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export const TIME_RANGE_OPTIONS = ['7d', '30d', '6m', '1y'] as const;

export const MOCK_STAT_METRICS: StatMetric[] = [
  {
    title: 'Total Tasks',
    value: '247',
    change: '+12.5%',
    trend: 'up',
    icon: '📊',
  },
  {
    title: 'Completed',
    value: '189',
    change: '+8.2%',
    trend: 'up',
    icon: '✓',
  },
  {
    title: 'In Progress',
    value: '42',
    change: '-3.1%',
    trend: 'down',
    icon: '⏳',
  },
  {
    title: 'Productivity',
    value: '87%',
    change: '+5.4%',
    trend: 'up',
    icon: '🚀',
  },
];

export const MOCK_TASK_COMPLETION_DATA: TaskCompletionData[] = [
  { month: 'January', completed: 45, pending: 15, overdue: 5 },
  { month: 'February', completed: 52, pending: 12, overdue: 8 },
  { month: 'March', completed: 61, pending: 18, overdue: 4 },
  { month: 'April', completed: 58, pending: 14, overdue: 6 },
  { month: 'May', completed: 70, pending: 10, overdue: 3 },
  { month: 'June', completed: 68, pending: 16, overdue: 7 },
];

export const MOCK_PROJECT_PROGRESS_DATA: ProjectProgress[] = [
  { project: 'State management', progress: 85, fill: 'var(--color-state)' },
  { project: 'Frontend Arch', progress: 72, fill: 'var(--color-frontend)' },
  { project: 'System Design', progress: 91, fill: 'var(--color-system)' },
  { project: 'OWASP Security', progress: 45, fill: 'var(--color-owasp)' },
  { project: 'Agile Process', progress: 67, fill: 'var(--color-agile)' },
];

export const MOCK_PRODUCTIVITY_DATA: ProductivityData[] = [
  { day: 'Monday', hours: 7.5 },
  { day: 'Tuesday', hours: 8.2 },
  { day: 'Wednesday', hours: 6.8 },
  { day: 'Thursday', hours: 8.5 },
  { day: 'Friday', hours: 7.0 },
  { day: 'Saturday', hours: 3.5 },
  { day: 'Sunday', hours: 2.0 },
];

export const MOCK_TASK_DISTRIBUTION_DATA: TaskDistribution[] = [
  { category: 'development', tasks: 35, fill: 'var(--color-development)' },
  { category: 'learning', tasks: 25, fill: 'var(--color-learning)' },
  { category: 'design', tasks: 20, fill: 'var(--color-design)' },
  { category: 'planning', tasks: 12, fill: 'var(--color-planning)' },
  { category: 'review', tasks: 8, fill: 'var(--color-review)' },
];

export const MOCK_PERFORMANCE_METRICS: PerformanceMetric[] = [
  { metric: 'Quality', score: 88 },
  { metric: 'Speed', score: 75 },
  { metric: 'Consistency', score: 92 },
  { metric: 'Innovation', score: 68 },
  { metric: 'Collaboration', score: 85 },
];
