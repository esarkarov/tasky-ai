import { AppTemplate, RootTemplate, sidebarLoader } from '@/core/router/lazy';
import { protectedRoutes } from '@/core/router/routes/protected.routes';
import { publicRoutes } from '@/core/router/routes/public.routes';
import { taskAction } from '@/features/tasks/router/lazy';
import { ErrorPage } from '@/pages/ErrorPage/ErrorPage';
import { Loader } from '@/shared/components/atoms/Loader/Loader';
import { RedirectIfAuthenticated } from '@/shared/components/guards/RedirectIfAuthenticated/RedirectIfAuthenticated';
import { RequireAuth } from '@/shared/components/guards/RequireAuth/RequireAuth';
import { ROUTES } from '@/shared/constants';
import { createElement } from 'react';
import { createBrowserRouter } from 'react-router';

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
