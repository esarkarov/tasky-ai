import { ROUTES } from '@/shared/constants';
import { RouteObject } from 'react-router';
import { Error } from '../components/atoms/Error/Error';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';

export const analyticsRoutes: RouteObject[] = [
  {
    path: ROUTES.APP_PATHS.DASHBOARD,
    lazy: async () => {
      const { DashboardPage } = await import('@/pages/DashboardPage/DashboardPage');
      const { dashboardLoader } = await import('@/features/analytics/router/loaders/dashboard.loader');

      return {
        Component: DashboardPage,
        loader: dashboardLoader,
      };
    },
    HydrateFallback: Skeleton,
    ErrorBoundary: Error,
  },
];
