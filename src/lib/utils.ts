import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import {
  formatRelative,
  isSameYear,
  format,
  isBefore,
  isToday,
  isTomorrow,
  startOfToday,
} from 'date-fns';
import { redirect } from 'react-router';
import { PATHS, RELATIVE_DAYS } from '@/constants';
import { env } from '@/config/env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function formatCustomDate(date: string | number | Date): string {
  const today = new Date();

  const relativeDay = toTitleCase(formatRelative(date, today).split(' at ')[0]);

  if (RELATIVE_DAYS.includes(relativeDay)) {
    return relativeDay;
  }

  if (isSameYear(date, today)) {
    return format(date, 'dd MMM');
  } else {
    return format(date, 'dd MMM yyyy');
  }
}

export function getTaskDueDateColorClass(
  dueDate: Date | null,
  completed?: boolean,
): string | undefined {
  if (dueDate === null || completed === undefined) return;

  if (isBefore(dueDate, startOfToday()) && !completed) {
    return 'text-red-500';
  }
  if (isToday(dueDate)) {
    return 'text-emerald-500';
  }
  if (isTomorrow(dueDate) && !completed) {
    return 'text-amber-500';
  }
}

export function generateID(): string {
  return Math.random().toString(36).slice(8) + Date.now().toString(36);
}

export function getUserId(): string {
  const clerkUserId = localStorage.getItem(env.clerkUserStorageKey);

  if (!clerkUserId) {
    redirect(PATHS.AUTH_SYNC);
    return '';
  }

  return clerkUserId;
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return `${str.slice(0, maxLength - 1)}...`;
  }

  return str;
}
