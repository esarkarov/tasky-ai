import { ROUTES } from '@/shared/constants';
import { createElement } from 'react';
import { RouteObject } from 'react-router';

export const ProjectsPage = async () => createElement((await import('@/pages/ProjectsPage/ProjectsPage')).ProjectsPage);
export const ProjectDetailPage = async () =>
  createElement((await import('@/pages/ProjectDetailPage/ProjectDetailPage')).ProjectDetailPage);
export const projectAction = async () =>
  (await import('@/features/projects/router/actions/project.action')).projectAction;
export const projectsLoader = async () =>
  (await import('@/features/projects/router/loaders/projects/projects.loader')).projectsLoader;
export const projectDetailLoader = async () =>
  (await import('@/features/projects/router/loaders/project-detail/project-detail.loader')).projectDetailLoader;

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
