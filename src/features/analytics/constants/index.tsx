import { TimeRange } from '@/features/analytics/types';
import { ChartConfig } from '@/shared/components/ui/chart';
import { AlertCircle, CheckCircle2, Clock, ListTodo, LucideIcon } from 'lucide-react';

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

export const WEEKLY_ACTIVITY_CONFIG = {
  tasks: {
    label: 'Tasks',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export const TIME_RANGE_OPTIONS = ['7d', '30d', '6m', '1y'] as const;
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MAX_DISPLAY_ITEMS = 5;
export const MAX_PROJECT_NAME_LENGTH = 30;
export const TRUNCATE_PROJECT_NAME_AT = 25;
export const MAX_CATEGORY_KEY_LENGTH = 20;

export const MAX_TASKS = 1000;
export const MAX_PROJECTS = 100;

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '7d': 'this week',
  '30d': 'this month',
  '6m': 'last 6 months',
  '1y': 'this year',
};
export const ICON_MAP: Record<string, LucideIcon> = {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
} as const;
