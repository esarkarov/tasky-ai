import { ROUTES } from '@/constants';
import { createElement, lazy } from 'react';
import { RouteObject } from 'react-router';
import inboxLoader from '../loaders/inboxLoader';
import todayLoader from '../loaders/todayLoader';
import upcomingLoader from '../loaders/upcomingLoader';
import completedLoader from '../loaders/completedLoader';

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
