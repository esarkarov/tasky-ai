import { createMockTaskCounts } from '@/core/test-setup/factories';
import { ROUTES } from '@/shared/constants';
import { cn, createEmptyState, getBadgeCount, getTaskDueDateColorClass } from '@/shared/utils/ui/ui.utils';
import clsx from 'clsx';
import { isBefore, isToday, isTomorrow, startOfToday } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('clsx');
vi.mock('tailwind-merge', () => ({
  twMerge: vi.fn(),
}));
vi.mock('date-fns', () => ({
  isBefore: vi.fn(),
  isToday: vi.fn(),
  isTomorrow: vi.fn(),
  startOfToday: vi.fn(),
}));
vi.mock('@/shared/constants', () => ({
  ROUTES: {
    INBOX: '/inbox',
    TODAY: '/today',
    UPCOMING: '/upcoming',
  },
}));

const mockClsx = vi.mocked(clsx);
const mockTwMerge = vi.mocked(twMerge);
const mockIsBefore = vi.mocked(isBefore);
const mockIsToday = vi.mocked(isToday);
const mockIsTomorrow = vi.mocked(isTomorrow);
const mockStartOfToday = vi.mocked(startOfToday);

describe('ui utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cn', () => {
    it('should call clsx with provided class names', () => {
      const classNames = ['class1', 'class2', 'class3'];
      const clsxResult = 'class1 class2 class3';
      mockClsx.mockReturnValue(clsxResult);
      mockTwMerge.mockReturnValue('merged-result');

      cn(...classNames);

      expect(mockClsx).toHaveBeenCalledWith(classNames);
      expect(mockClsx).toHaveBeenCalledOnce();
    });

    it('should call twMerge with clsx result', () => {
      const classNames = ['class1', 'class2'];
      const clsxResult = 'class1 class2';
      mockClsx.mockReturnValue(clsxResult);
      mockTwMerge.mockReturnValue('merged-result');

      cn(...classNames);

      expect(mockTwMerge).toHaveBeenCalledWith(clsxResult);
      expect(mockTwMerge).toHaveBeenCalledOnce();
    });

    it('should return twMerge result', () => {
      const classNames = ['class1', 'class2'];
      const expectedResult = 'merged-class1 merged-class2';
      mockClsx.mockReturnValue('class1 class2');
      mockTwMerge.mockReturnValue(expectedResult);

      const result = cn(...classNames);

      expect(result).toBe(expectedResult);
    });
  });

  describe('getTaskDueDateColorClass', () => {
    const MOCK_TODAY = new Date('2025-01-15T12:00:00Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(MOCK_TODAY);
      mockStartOfToday.mockReturnValue(MOCK_TODAY);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return undefined when dueDate is null', () => {
      const dueDate = null;
      const completed = false;

      const result = getTaskDueDateColorClass(dueDate, completed);

      expect(result).toBeUndefined();
    });

    it('should return red color for overdue incomplete tasks', () => {
      const overdueDate = new Date('2025-01-14T10:00:00Z');
      const completed = false;
      mockIsBefore.mockReturnValue(true);
      mockIsToday.mockReturnValue(false);
      mockIsTomorrow.mockReturnValue(false);

      const result = getTaskDueDateColorClass(overdueDate, completed);

      expect(mockIsBefore).toHaveBeenCalledWith(overdueDate, MOCK_TODAY);
      expect(mockIsBefore).toHaveBeenCalledOnce();
      expect(result).toBe('text-red-500');
    });

    it('should not return red color for overdue completed tasks', () => {
      const overdueDate = new Date('2025-01-14T10:00:00Z');
      const completed = true;
      mockIsBefore.mockReturnValue(true);
      mockIsToday.mockReturnValue(false);
      mockIsTomorrow.mockReturnValue(false);

      const result = getTaskDueDateColorClass(overdueDate, completed);

      expect(result).toBeUndefined();
    });

    it('should return emerald color for tasks due today', () => {
      const todayDate = new Date('2025-01-15T14:00:00Z');
      const completed = false;
      mockIsBefore.mockReturnValue(false);
      mockIsToday.mockReturnValue(true);
      mockIsTomorrow.mockReturnValue(false);

      const result = getTaskDueDateColorClass(todayDate, completed);

      expect(mockIsToday).toHaveBeenCalledWith(todayDate);
      expect(mockIsToday).toHaveBeenCalledOnce();
      expect(result).toBe('text-emerald-500');
    });

    it('should return emerald color for completed tasks due today', () => {
      const todayDate = new Date('2025-01-15T14:00:00Z');
      const completed = true;
      mockIsBefore.mockReturnValue(false);
      mockIsToday.mockReturnValue(true);
      mockIsTomorrow.mockReturnValue(false);

      const result = getTaskDueDateColorClass(todayDate, completed);

      expect(result).toBe('text-emerald-500');
    });

    it('should return amber color for incomplete tasks due tomorrow', () => {
      const tomorrowDate = new Date('2025-01-16T10:00:00Z');
      const completed = false;
      mockIsBefore.mockReturnValue(false);
      mockIsToday.mockReturnValue(false);
      mockIsTomorrow.mockReturnValue(true);

      const result = getTaskDueDateColorClass(tomorrowDate, completed);

      expect(mockIsTomorrow).toHaveBeenCalledWith(tomorrowDate);
      expect(mockIsTomorrow).toHaveBeenCalledOnce();
      expect(result).toBe('text-amber-500');
    });

    it('should return undefined for completed tasks due tomorrow', () => {
      const tomorrowDate = new Date('2025-01-16T10:00:00Z');
      const completed = true;
      mockIsBefore.mockReturnValue(false);
      mockIsToday.mockReturnValue(false);
      mockIsTomorrow.mockReturnValue(true);

      const result = getTaskDueDateColorClass(tomorrowDate, completed);

      expect(result).toBeUndefined();
    });

    it('should return undefined for tasks due beyond tomorrow', () => {
      const futureDate = new Date('2025-01-20T10:00:00Z');
      const completed = false;
      mockIsBefore.mockReturnValue(false);
      mockIsToday.mockReturnValue(false);
      mockIsTomorrow.mockReturnValue(false);

      const result = getTaskDueDateColorClass(futureDate, completed);

      expect(result).toBeUndefined();
    });
  });

  describe('getBadgeCount', () => {
    it('should return inbox task count for inbox route', () => {
      const taskCounts = createMockTaskCounts(3, 7);

      const result = getBadgeCount(ROUTES.INBOX, taskCounts);

      expect(result).toBe(7);
    });

    it('should return today task count for today route', () => {
      const taskCounts = createMockTaskCounts(12, 5);

      const result = getBadgeCount(ROUTES.TODAY, taskCounts);

      expect(result).toBe(12);
    });

    it('should return undefined for upcoming route', () => {
      const taskCounts = createMockTaskCounts(0, 5);

      const result = getBadgeCount(ROUTES.UPCOMING, taskCounts);

      expect(result).toBeUndefined();
    });

    it('should return zero when inbox count is zero', () => {
      const taskCounts = createMockTaskCounts(5, 0);

      const result = getBadgeCount(ROUTES.INBOX, taskCounts);

      expect(result).toBe(0);
    });

    it('should return zero when today count is zero', () => {
      const taskCounts = createMockTaskCounts(0, 5);

      const result = getBadgeCount(ROUTES.TODAY, taskCounts);

      expect(result).toBe(0);
    });

    it('should return undefined for unknown route', () => {
      const taskCounts = createMockTaskCounts(3, 5);
      const unknownRoute = '/unknown';

      const result = getBadgeCount(unknownRoute, taskCounts);

      expect(result).toBeUndefined();
    });
  });

  describe('createEmptyState', () => {
    it('should create empty state with correct structure', () => {
      const src = '/images/empty.png';
      const width = 420;
      const title = 'No Tasks';
      const description = 'You have no tasks in your inbox';

      const result = createEmptyState(src, width, title, description);

      expect(result).toEqual({
        img: {
          src: '/images/empty.png',
          width: 420,
          height: 260,
        },
        title: 'No Tasks',
        description: 'You have no tasks in your inbox',
      });
    });

    it('should set image source correctly', () => {
      const src = '/custom/path/image.svg';
      const width = 300;
      const title = 'Empty';
      const description = 'No data';

      const result = createEmptyState(src, width, title, description);

      expect(result.img.src).toBe('/custom/path/image.svg');
    });

    it('should set image width correctly', () => {
      const src = '/image.png';
      const width = 500;
      const title = 'Empty';
      const description = 'No data';

      const result = createEmptyState(src, width, title, description);

      expect(result.img.width).toBe(500);
    });

    it('should always set height to 260', () => {
      const src = '/image.png';
      const width = 300;
      const title = 'Empty';
      const description = 'No data';

      const result = createEmptyState(src, width, title, description);

      expect(result.img.height).toBe(260);
    });

    it('should set title correctly', () => {
      const src = '/image.png';
      const width = 300;
      const title = 'No Projects Found';
      const description = 'Create your first project';

      const result = createEmptyState(src, width, title, description);

      expect(result.title).toBe('No Projects Found');
    });

    it('should set description correctly', () => {
      const src = '/image.png';
      const width = 300;
      const title = 'Empty';
      const description = 'Start by adding your first item to the list';

      const result = createEmptyState(src, width, title, description);

      expect(result.description).toBe('Start by adding your first item to the list');
    });
  });
});
