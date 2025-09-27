import { ROUTES } from '@/constants';
import AppLayout from '@/layouts/AppLayout';
import RootLayout from '@/layouts/RootLayout';
import { createElement, lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import taskAction from './actions/taskAction';
import appLoader from './loaders/appLoader';
import { appRoutes } from './modules/appRoutes';
import { publicRoutes } from './modules/publicRoutes';

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
