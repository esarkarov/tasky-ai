import { HomePage, LoginPage, RegisterPage } from '@/core/router/lazy';
import { ROUTES } from '@/shared/constants/routes';
import { RouteObject } from 'react-router';

export const publicRoutes: RouteObject[] = [
  {
    index: true,
    lazy: {
      element: HomePage,
    },
  },
  {
    path: ROUTES.REGISTER,
    lazy: {
      element: RegisterPage,
    },
  },
  {
    path: ROUTES.LOGIN,
    lazy: {
      element: LoginPage,
    },
  },
];
