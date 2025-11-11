import { env } from '@/core/config/env.config';
import { ROUTES } from '@/shared/constants/routes';
import { redirect } from 'react-router';

export function getUserId() {
  const clerkUserId = localStorage.getItem(env.clerkUserStorageKey);

  if (!clerkUserId) {
    redirect(ROUTES.LOGIN);
    return '';
  }

  return clerkUserId;
}
