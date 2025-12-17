import { MAX_CATEGORY_KEY_LENGTH, MAX_DISPLAY_ITEMS } from '@/features/analytics/constants';
import { TaskStatus, TimeRange } from '@/features/analytics/types';
import { Task } from '@/features/tasks/types';

export const getDateRange = (timeRange: TimeRange): Date => {
  const now = new Date();
  const date = new Date(now);

  switch (timeRange) {
    case '7d':
      date.setDate(now.getDate() - 7);
      break;
    case '30d':
      date.setDate(now.getDate() - 30);
      break;
    case '6m':
      date.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      date.setFullYear(now.getFullYear() - 1);
      break;
  }

  return date;
};

export const getTaskStatus = (task: Task): TaskStatus => {
  if (task.completed) {
    return 'completed';
  }

  if (task.due_date) {
    const dueDate = new Date(task.due_date);
    const now = new Date();

    if (dueDate < now) {
      return 'overdue';
    }
  }

  return 'pending';
};

export const getMonthName = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'long' });
};

export const getDayName = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('default', { weekday: 'long' });
};

export const getLast6Months = () => {
  const months: string[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleString('default', { month: 'long' }));
  }

  return months;
};

export const createCategoryKey = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '_').substring(0, MAX_CATEGORY_KEY_LENGTH);
};

export const getChartColor = (index: number, customColor?: string): string => {
  if (customColor) return customColor;
  const colorIndex = (index % MAX_DISPLAY_ITEMS) + 1;
  return `hsl(var(--chart-${colorIndex}))`;
};

export const truncateText = (text: string, maxLength: number, truncateAt: number): string => {
  return text.length > maxLength ? `${text.substring(0, truncateAt)}...` : text;
};
