import { ROUTES } from '@/shared/constants';
import { createElement } from 'react';
import { RouteObject } from 'react-router';

export const DashboardPage = async () =>
  createElement((await import('@/pages/DashboardPage/DashboardPage')).DashboardPage);

export const dashboardRoutes: RouteObject[] = [
  {
    path: ROUTES.APP_PATHS.DASHBOARD,
    lazy: {
      element: DashboardPage,
    },
  },
];
