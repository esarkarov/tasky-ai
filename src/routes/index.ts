import { PATHS } from '@/constants';
import RootLayout from '@/layouts/RootLayout';
import AuthSyncPage from '@/pages/AuthSyncPage';
import ErrorPage from '@/pages/ErrorPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import { createElement } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';

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

const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: createElement(RootLayout),
    errorElement: createElement(ErrorPage),
    children: rootRouteChildren,
  },
]);

export default router;
