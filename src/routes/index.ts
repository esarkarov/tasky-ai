import { PATHS } from '@/constants';
import AppLayout from '@/layouts/AppLayout';
import RootLayout from '@/layouts/RootLayout';
import AuthSyncPage from '@/pages/AuthSyncPage';
import ErrorPage from '@/pages/ErrorPage';
import HomePage from '@/pages/HomePage';
import InboxPage from '@/pages/InboxPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import { createElement } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import appAction from './actions/appAction';

const rootRouteChildren: RouteObject[] = [
  {
    index: true,
    element: createElement(HomePage),
  },
  {
    path: PATHS.REGISTER,
    element: createElement(RegisterPage),
  },
  {
    path: PATHS.LOGIN,
    element: createElement(LoginPage),
  },
  {
    path: PATHS.AUTH_SYNC,
    element: createElement(AuthSyncPage),
  },
];

const appRouteChildren: RouteObject[] = [
  {
    path: 'inbox',
    element: createElement(InboxPage),
  },
];

const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: createElement(RootLayout),
    errorElement: createElement(ErrorPage),
    children: rootRouteChildren,
  },
  {
    path: PATHS.APP,
    element: createElement(AppLayout),
    errorElement: createElement(ErrorPage),
    children: appRouteChildren,
    action: appAction,
  },
]);

export default router;
