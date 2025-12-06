import {
  projectAction,
  projectDetailLoader,
  ProjectDetailPage,
  projectsLoader,
  ProjectsPage,
} from '@/features/projects/router/lazy';
import { ROUTES } from '@/shared/constants';
import { RouteObject } from 'react-router';

export const projectRoutes: RouteObject[] = [
  {
    path: ROUTES.APP_PATHS.PROJECTS,
    lazy: {
      element: ProjectsPage,
      action: projectAction,
      loader: projectsLoader,
    },
  },
  {
    path: ROUTES.APP_PATHS.PROJECT_DETAIL,
    lazy: {
      element: ProjectDetailPage,
      action: projectAction,
      loader: projectDetailLoader,
    },
  },
];
