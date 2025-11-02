import { createElement } from 'react';

export const RootTemplate = async () =>
  createElement((await import('@/components/templates/RootTemplate/RootTemplate')).RootTemplate);
export const AppTemplate = async () =>
  createElement((await import('@/components/templates/AppTemplate/AppTemplate')).AppTemplate);

export const HomePage = async () => createElement((await import('@/pages/HomePage/HomePage')).HomePage);
export const LoginPage = async () => createElement((await import('@/pages/LoginPage/LoginPage')).LoginPage);
export const RegisterPage = async () => createElement((await import('@/pages/RegisterPage/RegisterPage')).RegisterPage);
export const InboxPage = async () => createElement((await import('@/pages/InboxPage/InboxPage')).InboxPage);
export const TodayPage = async () => createElement((await import('@/pages/TodayPage/TodayPage')).TodayPage);
export const UpcomingPage = async () => createElement((await import('@/pages/UpcomingPage/UpcomingPage')).UpcomingPage);
export const CompletedPage = async () =>
  createElement((await import('@/pages/CompletedPage/CompletedPage')).CompletedPage);
export const ProjectsPage = async () => createElement((await import('@/pages/ProjectsPage/ProjectsPage')).ProjectsPage);
export const ProjectDetailPage = async () =>
  createElement((await import('@/pages/ProjectDetailPage/ProjectDetailPage')).ProjectDetailPage);

export const taskAction = async () => (await import('@/router/actions/task/task.action')).taskAction;
export const projectAction = async () => (await import('@/router/actions/project/project.action')).projectAction;

export const sidebarLoader = async () => (await import('@/router/loaders/sidebar/sidebar.loader')).sidebarLoader;
export const tasksCompletedLoader = async () =>
  (await import('@/router/loaders/tasks-completed/tasks-completed.loader')).tasksCompletedLoader;
export const tasksInboxLoader = async () =>
  (await import('@/router/loaders/tasks-inbox/tasks-inbox.loader')).tasksInboxLoader;
export const projectsLoader = async () => (await import('@/router/loaders/projects/projects.loader')).projectsLoader;
export const tasksTodayLoader = async () =>
  (await import('@/router/loaders/tasks-today/tasks-today.loader')).tasksTodayLoader;
export const tasksUpcomingLoader = async () =>
  (await import('@/router/loaders/tasks-upcoming/tasks-upcoming.loader')).tasksUpcomingLoader;
export const projectDetailLoader = async () =>
  (await import('@/router/loaders/project-detail/project-detail.loader')).projectDetailLoader;
