import { projectRoutes } from '@/features/projects/router/project.routes';
import { taskRoutes } from '@/features/tasks/router/task.routes';
import { RouteObject } from 'react-router';

export const protectedRoutes: RouteObject[] = [...taskRoutes, ...projectRoutes];
