import AppLayout from '@/components/layout/AppLayout';
import RootLayout from '@/components/layout/RootLayout';
import { ROUTES } from '@/constants';
import taskAction from '@/routes/actions/taskAction';
import appLoader from '@/routes/loaders/appLoader';
import { appRoutes } from '@/routes/modules/appRoutes';
import { publicRoutes } from '@/routes/modules/publicRoutes';
import { createElement, lazy } from 'react';
import { createBrowserRouter } from 'react-router';

export const ErrorPage = lazy(() =>
  import('@/pages/ErrorPage').then((module) => ({ default: module.default }))
);

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: createElement(RootLayout),
    errorElement: createElement(ErrorPage),
    children: publicRoutes,
  },
  {
    path: ROUTES.APP,
    element: createElement(AppLayout),
    errorElement: createElement(ErrorPage),
    children: appRoutes,
    action: taskAction,
    loader: appLoader,
  },
  {
    path: '*',
    element: createElement(ErrorPage),
  },
]);

export default router;
