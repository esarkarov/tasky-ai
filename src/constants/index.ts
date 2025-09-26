import { Calendar1, CalendarDays, CircleCheck, Inbox } from 'lucide-react';

export const TOOLTIP_DELAY = 500;

export const PATHS = {
  HOME: '/',
  REGISTER: '/register',
  LOGIN: '/login',
  AUTH_SYNC: '/auth-sync',
  APP: '/app',
  TODAY: '/app/today',
  INBOX: '/app/inbox',
} as const;

export const SOCIAL_LINKS = [
  {
    href: 'https://linkedin.com/in/elvinsarkarov',
    label: 'LinkedIn',
  },
  {
    href: 'https://github.com/esarkarov',
    label: 'GitHub',
  },
] as const;

export const SIDEBAR_LINKS = [
  {
    href: '/app/inbox',
    label: 'Inbox',
    icon: Inbox,
  },
  {
    href: '/app/today',
    label: 'Today',
    icon: Calendar1,
  },
  {
    href: '/app/upcoming',
    label: 'Upcoming',
    icon: CalendarDays,
  },
  {
    href: '/app/completed',
    label: 'Completed',
    icon: CircleCheck,
  },
] as const;

export const RELATIVE_DAYS = [
  'Today',
  'Tomorrow',
  'Yesterday',
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];
