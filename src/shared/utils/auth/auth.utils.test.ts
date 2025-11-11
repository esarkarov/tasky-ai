import { env } from '@/core/config/env.config';
import { ROUTES } from '@/shared/constants/routes';
import { getUserId } from '@/shared/utils/auth/auth.utils';
import { redirect } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/config/env.config', () => ({
  env: {
    clerkUserStorageKey: 'clerk-user-key',
  },
}));

vi.mock('@/shared/constants/routes', () => ({
  ROUTES: {
    LOGIN: '/login',
  },
}));

vi.mock('react-router', () => ({
  redirect: vi.fn(),
}));

const mockedRedirect = vi.mocked(redirect);

describe('auth utils', () => {
  const STORAGE_KEY = env.clerkUserStorageKey;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getUserId', () => {
    const setUserId = (userId: string | null) => {
      if (userId === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, userId);
      }
    };

    describe('when user ID exists in session storage', () => {
      it('should return the user ID and not redirect', () => {
        const mockUserId = 'user-123';
        setUserId(mockUserId);

        const result = getUserId();

        expect(result).toBe(mockUserId);
        expect(mockedRedirect).not.toHaveBeenCalled();
      });
    });

    describe('when user ID is missing or invalid', () => {
      it.each([
        { scenario: 'not present', userId: null },
        { scenario: 'empty string', userId: '' },
      ])('should redirect to auth sync when user ID is $scenario', ({ userId }) => {
        setUserId(userId);

        const result = getUserId();

        expect(result).toBe('');
        expect(mockedRedirect).toHaveBeenCalledWith(ROUTES.LOGIN);
      });
    });

    describe('storage key configuration', () => {
      it('should use the storage key from environment config', () => {
        const mockUserId = 'user-456';
        setUserId(mockUserId);

        getUserId();

        expect(localStorage.getItem(STORAGE_KEY)).toBe(mockUserId);
      });
    });
  });
});
