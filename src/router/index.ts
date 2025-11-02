import { Loader } from '@/components/atoms/Loader/Loader';
import { RedirectIfAuthenticated } from '@/components/guards/RedirectIfAuthenticated/RedirectIfAuthenticated';
import { RequireAuth } from '@/components/guards/RequireAuth/RequireAuth';
import { ROUTES } from '@/constants/routes';
import { ErrorPage } from '@/pages/ErrorPage/ErrorPage';
import { sidebarLoader, AppTemplate, RootTemplate, taskAction } from '@/router/lazy/router-lazy';
import { protectedRoutes } from '@/router/routes/protected.routes';
import { publicRoutes } from '@/router/routes/public.routes';
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
