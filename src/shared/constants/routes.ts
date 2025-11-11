const APP_BASE = '/app';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  APP: APP_BASE,
  INBOX: `${APP_BASE}/inbox`,
  TODAY: `${APP_BASE}/today`,
  UPCOMING: `${APP_BASE}/upcoming`,
  COMPLETED: `${APP_BASE}/completed`,
  PROJECTS: `${APP_BASE}/projects`,
  PROJECT: (id: string | undefined) => `${APP_BASE}/projects/${id}`,
  NOT_FOUND: '*',

  APP_PATHS: {
    INBOX: 'inbox',
    TODAY: 'today',
    UPCOMING: 'upcoming',
    COMPLETED: 'completed',
    PROJECTS: 'projects',
    PROJECT_DETAIL: 'projects/:projectId',
  },
} as const;
