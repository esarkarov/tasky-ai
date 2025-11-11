import { createElement } from 'react';

export const HomePage = async () => createElement((await import('@/pages/HomePage/HomePage')).HomePage);
export const InboxPage = async () => createElement((await import('@/pages/InboxPage/InboxPage')).InboxPage);
export const TodayPage = async () => createElement((await import('@/pages/TodayPage/TodayPage')).TodayPage);
export const UpcomingPage = async () => createElement((await import('@/pages/UpcomingPage/UpcomingPage')).UpcomingPage);
export const CompletedPage = async () =>
  createElement((await import('@/pages/CompletedPage/CompletedPage')).CompletedPage);

export const taskAction = async () => (await import('@/features/tasks/router/actions/task.action')).taskAction;

export const tasksCompletedLoader = async () =>
  (await import('@/features/tasks/router/loaders/tasks-completed/tasks-completed.loader')).tasksCompletedLoader;
export const tasksInboxLoader = async () =>
  (await import('@/features/tasks/router/loaders/tasks-inbox/tasks-inbox.loader')).tasksInboxLoader;
export const tasksTodayLoader = async () =>
  (await import('@/features/tasks/router/loaders/tasks-today/tasks-today.loader')).tasksTodayLoader;
export const tasksUpcomingLoader = async () =>
  (await import('@/features/tasks/router/loaders/tasks-upcoming/tasks-upcoming.loader')).tasksUpcomingLoader;
