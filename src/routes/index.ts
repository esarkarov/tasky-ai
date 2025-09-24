import { createBrowserRouter, type RouteObject } from 'react-router';
import HomePage from '@/pages/HomePage';
import React from 'react';
import RootLayout from '@/layouts/RootLayout';

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
    children: rootRouteChildren,
  },
]);

export default router;
