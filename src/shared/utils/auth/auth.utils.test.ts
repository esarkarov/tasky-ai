import { env } from '@/core/config/env.config';
import { ROUTES } from '@/shared/constants';
import { getUserId } from '@/shared/utils/auth/auth.utils';
import { redirect } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/config/env.config', () => ({
  env: {
    clerkUserStorageKey: 'clerk-user-key',
  },
}));

vi.mock('@/shared/constants', () => ({
  ROUTES: {
    LOGIN: '/login',
  },
}));

vi.mock('react-router', () => ({
  redirect: vi.fn(),
}));

const mockRedirect = vi.mocked(redirect);

describe('getUserId', () => {
  const STORAGE_KEY = env.clerkUserStorageKey;
  const MOCK_USER_ID = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('successful authentication', () => {
    it('should return user ID when present in localStorage', () => {
      localStorage.setItem(STORAGE_KEY, MOCK_USER_ID);

      const result = getUserId();

      expect(result).toBe(MOCK_USER_ID);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should not redirect when user ID is valid', () => {
      localStorage.setItem(STORAGE_KEY, 'user-456');

      getUserId();

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('missing authentication', () => {
    it('should redirect to login when user ID is not in localStorage', () => {
      const result = getUserId();

      expect(result).toBe('');
      expect(mockRedirect).toHaveBeenCalledWith(ROUTES.LOGIN);
      expect(mockRedirect).toHaveBeenCalledOnce();
    });

    it('should redirect to login when user ID is empty string', () => {
      localStorage.setItem(STORAGE_KEY, '');

      const result = getUserId();

      expect(result).toBe('');
      expect(mockRedirect).toHaveBeenCalledWith(ROUTES.LOGIN);
      expect(mockRedirect).toHaveBeenCalledOnce();
    });

    it('should return empty string when redirecting', () => {
      localStorage.removeItem(STORAGE_KEY);

      const result = getUserId();

      expect(result).toBe('');
    });
  });

  describe('storage key usage', () => {
    it('should use clerk storage key from environment config', () => {
      localStorage.setItem(STORAGE_KEY, MOCK_USER_ID);

      const result = getUserId();

      expect(localStorage.getItem(STORAGE_KEY)).toBe(MOCK_USER_ID);
      expect(result).toBe(MOCK_USER_ID);
    });

    it('should read from correct localStorage key', () => {
      const differentKey = 'different-key';
      localStorage.setItem(differentKey, 'other-user');
      localStorage.setItem(STORAGE_KEY, MOCK_USER_ID);

      const result = getUserId();

      expect(result).toBe(MOCK_USER_ID);
      expect(result).not.toBe('other-user');
    });
  });
});
