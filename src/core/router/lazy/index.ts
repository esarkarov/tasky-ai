import { createElement } from 'react';

export const RootTemplate = async () =>
  createElement((await import('@/shared/components/templates/RootTemplate/RootTemplate')).RootTemplate);
export const AppTemplate = async () =>
  createElement((await import('@/shared/components/templates/AppTemplate/AppTemplate')).AppTemplate);
export const HomePage = async () => createElement((await import('@/pages/HomePage/HomePage')).HomePage);
export const LoginPage = async () => createElement((await import('@/pages/LoginPage/LoginPage')).LoginPage);
export const RegisterPage = async () => createElement((await import('@/pages/RegisterPage/RegisterPage')).RegisterPage);
export const sidebarLoader = async () => (await import('@/core/router/loaders/sidebar.loader')).sidebarLoader;
