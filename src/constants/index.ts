import {
  completedTaskEmptyState,
  inboxTaskEmptyState,
  projectTaskEmptyState,
  todayTaskEmptyState,
  upcomingTaskEmptyState,
} from '@/assets';
import { IEmptyStateContent, ITaskForm } from '@/interfaces';
import { TEmptyStateType } from '@/types';
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
  PROJECT: (id: string | undefined) => `/app/projects/${id}`,
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

export const EMPTY_STATES: Record<TEmptyStateType, IEmptyStateContent> = {
  today: {
    img: {
      src: todayTaskEmptyState,
      width: 226,
      height: 260,
    },
    title: 'What do you need to get done today?',
    description:
      'By default, tasks added here will be due today. Click + to add a task.',
  },
  inbox: {
    img: {
      src: inboxTaskEmptyState,
      width: 344,
      height: 260,
    },
    title: 'What’s on your mind?',
    description:
      'Capture tasks that don’t have a specific category. Click + to add a task.',
  },
  upcoming: {
    img: {
      src: upcomingTaskEmptyState,
      width: 208,
      height: 260,
    },
    title: 'Plan ahead with ease!',
    description:
      'Tasks added here will be due in the future. Click + to schedule a task.',
  },
  completed: {
    img: {
      src: completedTaskEmptyState,
      width: 231,
      height: 260,
    },
    title: 'You’ve been productive!',
    description:
      'All the tasks you’ve completed will appear here. Keep up the great work!',
  },
  project: {
    img: {
      src: projectTaskEmptyState,
      width: 228,
      height: 260,
    },
    title: 'Let’s build something amazing!',
    description:
      'Add tasks specific to this project. Click + to start planning.',
  },
};

export const DEFAULT_FORM_DATA: ITaskForm = {
  content: '',
  due_date: null,
  projectId: null,
};
