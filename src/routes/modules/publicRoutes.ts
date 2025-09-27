import { ROUTES } from '@/constants';
import { createElement, lazy } from 'react';
import { RouteObject } from 'react-router';

export const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.default }))
);
export const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((module) => ({ default: module.default }))
);
export const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((module) => ({
    default: module.default,
  }))
);
export const AuthSyncPage = lazy(() =>
  import('@/pages/AuthSyncPage').then((module) => ({
    default: module.default,
  }))
);

export const publicRoutes: RouteObject[] = [
  {
    index: true,
    element: createElement(HomePage),
  },
  {
    path: ROUTES.REGISTER,
    element: createElement(RegisterPage),
  },
  {
    path: ROUTES.LOGIN,
    element: createElement(LoginPage),
  },
  {
    path: ROUTES.AUTH_SYNC,
    element: createElement(AuthSyncPage),
  },
];
