import { Query } from 'appwrite';

export const taskQueries = {
  selectIdOnly: () => Query.select(['$id']),
  byUserId: (userId: string) => Query.equal('userId', userId),
  byCompleted: (isCompleted: boolean) => Query.equal('completed', isCompleted),
  withoutProject: () => Query.isNull('projectId'),
  withDueDate: () => Query.isNotNull('due_date'),
  byDueDateRange: (start: string, end: string) =>
    Query.and([Query.greaterThanEqual('due_date', start), Query.lessThan('due_date', end)]),
  byDueDateFrom: (date: string) => Query.greaterThanEqual('due_date', date),
  orderByDueDateAsc: () => Query.orderAsc('due_date'),
  orderByUpdatedDesc: () => Query.orderDesc('$updatedAt'),
  limit: (count: number) => Query.limit(count),

  forTodayTasks: (todayDate: string, tomorrowDate: string, userId: string) => [
    taskQueries.byUserId(userId),
    taskQueries.byCompleted(false),
    taskQueries.byDueDateRange(todayDate, tomorrowDate),
  ],
  forTodayTasksCount: (todayDate: string, tomorrowDate: string, userId: string) => [
    taskQueries.selectIdOnly(),
    taskQueries.byUserId(userId),
    taskQueries.byCompleted(false),
    taskQueries.byDueDateRange(todayDate, tomorrowDate),
    taskQueries.limit(1),
  ],
  forInboxTasks: (userId: string) => [
    taskQueries.byUserId(userId),
    taskQueries.byCompleted(false),
    taskQueries.withoutProject(),
  ],
  forInboxTasksCount: (userId: string) => [
    taskQueries.selectIdOnly(),
    taskQueries.byUserId(userId),
    taskQueries.byCompleted(false),
    taskQueries.withoutProject(),
    taskQueries.limit(1),
  ],
  forCompletedTasks: (userId: string) => [
    taskQueries.byUserId(userId),
    taskQueries.byCompleted(true),
    taskQueries.orderByUpdatedDesc(),
  ],
  forUpcomingTasks: (todayDate: string, userId: string) => [
    taskQueries.byUserId(userId),
    taskQueries.byCompleted(false),
    taskQueries.withDueDate(),
    taskQueries.byDueDateFrom(todayDate),
    taskQueries.orderByDueDateAsc(),
  ],
};
