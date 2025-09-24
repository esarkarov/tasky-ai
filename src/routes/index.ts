import { createBrowserRouter, type RouteObject } from 'react-router';
import HomePage from '@/pages/HomePage';
import React from 'react';
import RootLayout from '@/layouts/RootLayout';
import ErrorPage from '@/pages/ErrorPage';

const rootRouteChildren: RouteObject[] = [
  {
    index: true,
    element: React.createElement(HomePage),
  },
];

const router = createBrowserRouter([
  {
    path: '/',
    element: React.createElement(RootLayout),
    errorElement: React.createElement(ErrorPage),
    children: rootRouteChildren,
  },
]);

export default router;
