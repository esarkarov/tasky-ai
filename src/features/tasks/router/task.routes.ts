import {
  CompletedPage,
  InboxPage,
  tasksCompletedLoader,
  tasksInboxLoader,
  tasksTodayLoader,
  tasksUpcomingLoader,
  TodayPage,
  UpcomingPage,
} from '@/features/tasks/router/lazy';
import { ROUTES } from '@/shared/constants/routes';
import { RouteObject } from 'react-router';

export const taskRoutes: RouteObject[] = [
  {
    path: ROUTES.APP_PATHS.INBOX,
    lazy: {
      element: InboxPage,
      loader: tasksInboxLoader,
    },
  },
  {
    path: ROUTES.APP_PATHS.TODAY,
    lazy: {
      element: TodayPage,
      loader: tasksTodayLoader,
    },
  },
  {
    path: ROUTES.APP_PATHS.UPCOMING,
    lazy: {
      element: UpcomingPage,
      loader: tasksUpcomingLoader,
    },
  },
  {
    path: ROUTES.APP_PATHS.COMPLETED,
    lazy: {
      element: CompletedPage,
      loader: tasksCompletedLoader,
    },
  },
];
