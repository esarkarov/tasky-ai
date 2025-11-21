// HTTP Methods and Status Codes
export const HTTP_METHODS = {
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  GET: 'GET',
} as const;
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Timing Constants
export const TIMING = {
  DELAY_DURATION: 500,
  TOAST_DURATION: 2500,
  LOAD_DELAY: 300,
  SCROLL_THRESHOLD: 70,
} as const;

// Validation Constants
export const MAX_CONTENT_LENGTH = 250;
export const MAX_NAME_LENGTH = 50;
export const MAX_PROMPT_LENGTH = 150;
export const MAX_PROJECT_NAME_TRUNCATE_LENGTH = 32;
export const MAX_TASK_CONTENT_TRUNCATE_LENGTH = 50;
export const INPUT_WARN_THRESHOLD = 10;

// Application Routes
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
