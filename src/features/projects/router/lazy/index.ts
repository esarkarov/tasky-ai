import { createElement } from 'react';

export const ProjectsPage = async () => createElement((await import('@/pages/ProjectsPage/ProjectsPage')).ProjectsPage);
export const ProjectDetailPage = async () =>
  createElement((await import('@/pages/ProjectDetailPage/ProjectDetailPage')).ProjectDetailPage);

export const projectAction = async () =>
  (await import('@/features/projects/router/actions/project.action')).projectAction;

export const projectsLoader = async () =>
  (await import('@/features/projects/router/loaders/projects/projects.loader')).projectsLoader;
export const projectDetailLoader = async () =>
  (await import('@/features/projects/router/loaders/project-detail/project-detail.loader')).projectDetailLoader;
