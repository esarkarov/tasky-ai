import { ROUTES } from '@/constants';
import completedLoader from '@/routes/loaders/completedLoader';
import inboxLoader from '@/routes/loaders/inboxLoader';
import todayLoader from '@/routes/loaders/todayLoader';
import upcomingLoader from '@/routes/loaders/upcomingLoader';
import { createElement, lazy } from 'react';
import { RouteObject } from 'react-router';

export const InboxPage = lazy(() =>
  import('@/pages/InboxPage').then((module) => ({ default: module.default }))
);
export const TodayPage = lazy(() =>
  import('@/pages/TodayPage').then((module) => ({ default: module.default }))
);
export const UpcomingPage = lazy(() =>
  import('@/pages/UpcomingPage').then((module) => ({
    default: module.default,
  }))
);
export const CompletedPage = lazy(() =>
  import('@/pages/CompletedPage').then((module) => ({
    default: module.default,
  }))
);

export const appRoutes: RouteObject[] = [
  {
    path: ROUTES.APP_PATHS.INBOX,
    element: createElement(InboxPage),
    loader: inboxLoader,
  },
  {
    path: ROUTES.APP_PATHS.TODAY,
    element: createElement(TodayPage),
    loader: todayLoader,
  },
  {
    path: ROUTES.APP_PATHS.UPCOMING,
    element: createElement(UpcomingPage),
    loader: upcomingLoader,
  },
  {
    path: ROUTES.APP_PATHS.COMPLETED,
    element: createElement(CompletedPage),
    loader: completedLoader,
  },
];
