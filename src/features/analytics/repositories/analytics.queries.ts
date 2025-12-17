import { MAX_PROJECTS, MAX_TASKS } from '@/features/analytics/constants';
import { TimeRange } from '@/features/analytics/types';
import { getDateRange } from '@/features/analytics/utils/analytics.utils';
import { Query } from 'appwrite';

export const analyticsQueries = {
  byUserId: (userId: string) => Query.equal('userId', userId),
  byCompleted: (completed: boolean) => Query.equal('completed', completed),
  createdAfter: (date: Date) => Query.greaterThanEqual('$createdAt', date.toISOString()),
  dueBefore: (date: Date) => Query.lessThan('due_date', date.toISOString()),
  hasDueDate: () => Query.isNotNull('due_date'),
  orderByCreatedDesc: () => Query.orderDesc('$createdAt'),
  orderByCreatedAsc: () => Query.orderAsc('$createdAt'),
  limit: (count: number) => Query.limit(count),
  minimalLimit: () => Query.limit(1),

  forTasksInTimeRange: (userId: string, timeRange: TimeRange) => {
    const startDate = getDateRange(timeRange);

    return [
      analyticsQueries.byUserId(userId),
      analyticsQueries.createdAfter(startDate),
      analyticsQueries.orderByCreatedDesc(),
      analyticsQueries.limit(MAX_TASKS),
    ];
  },
  forUserProjects: (userId: string) => {
    return [
      analyticsQueries.byUserId(userId),
      analyticsQueries.orderByCreatedDesc(),
      analyticsQueries.limit(MAX_PROJECTS),
    ];
  },
  forTotalTasksCount: (userId: string) => {
    return [analyticsQueries.byUserId(userId), analyticsQueries.minimalLimit()];
  },
  forCompletedTasksCount: (userId: string) => {
    return [analyticsQueries.byUserId(userId), analyticsQueries.byCompleted(true), analyticsQueries.minimalLimit()];
  },
  forPendingTasksCount: (userId: string) => {
    return [analyticsQueries.byUserId(userId), analyticsQueries.byCompleted(false), analyticsQueries.minimalLimit()];
  },
  forOverdueTasksCount: (userId: string) => {
    const now = new Date();

    return [
      analyticsQueries.byUserId(userId),
      analyticsQueries.byCompleted(false),
      analyticsQueries.hasDueDate(),
      analyticsQueries.dueBefore(now),
      analyticsQueries.minimalLimit(),
    ];
  },
};
