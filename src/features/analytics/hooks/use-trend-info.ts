import { TaskCompletionData } from '@/features/analytics/types';

export const useTrendInfo = (params: TaskCompletionData[]) => {
  if (params.length < 2) {
    return { trend: 0, isPositive: true, dateRange: '' };
  }

  const recentMonths = params.slice(-2);
  const [previousMonth, currentMonth] = recentMonths;

  const prevCompleted = previousMonth.completed;
  const currCompleted = currentMonth.completed;
  const percentageChange = prevCompleted > 0 ? Math.round(((currCompleted - prevCompleted) / prevCompleted) * 100) : 0;

  const isPositive = percentageChange >= 0;

  const firstMonth = params[0].month;
  const lastMonth = params[params.length - 1].month;
  const dateRange = `${firstMonth} - ${lastMonth}`;

  return {
    trend: Math.abs(percentageChange),
    isPositive,
    dateRange,
  };
};
