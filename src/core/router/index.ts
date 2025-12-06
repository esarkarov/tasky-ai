import { AppTemplate, HomePage, LoginPage, RegisterPage, RootTemplate, sidebarLoader } from '@/core/router/lazy';
import { projectRoutes } from '@/features/projects/router';
import { taskAction } from '@/features/tasks/router/lazy';
import { taskRoutes } from '@/features/tasks/router';
import { ErrorPage } from '@/pages/ErrorPage/ErrorPage';
import { Loader } from '@/shared/components/atoms/Loader/Loader';
import { RedirectIfAuthenticated } from '@/shared/components/guards/RedirectIfAuthenticated/RedirectIfAuthenticated';
import { RequireAuth } from '@/shared/components/guards/RequireAuth/RequireAuth';
import { ROUTES } from '@/shared/constants';
import { createElement } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router';

export const protectedRoutes: RouteObject[] = [...taskRoutes, ...projectRoutes];

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

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    errorElement: createElement(ErrorPage),
    hydrateFallbackElement: createElement(Loader),
    lazy: {
      element: RootTemplate,
    },
    children: [
      {
        element: createElement(RedirectIfAuthenticated),
        children: publicRoutes,
      },
    ],
  },
  {
    path: ROUTES.APP,
    errorElement: createElement(ErrorPage),
    hydrateFallbackElement: createElement(Loader),
    lazy: {
      element: AppTemplate,
      action: taskAction,
      loader: sidebarLoader,
    },
    children: [
      {
        element: createElement(RequireAuth),
        children: protectedRoutes,
      },
    ],
  },
  {
    path: ROUTES.NOT_FOUND,
    lazy: async () => ({
      Component: ErrorPage,
    }),
  },
]);
