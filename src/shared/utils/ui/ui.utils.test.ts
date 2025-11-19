import { TaskCounts } from '@/features/tasks/types';
import { ROUTES } from '@/shared/constants/routes';
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
vi.mock('@/shared/constants/routes', () => ({
  ROUTES: {
    INBOX: '/inbox',
    TODAY: '/today',
    UPCOMING: '/upcoming',
  },
}));

const mockedClsx = vi.mocked(clsx);
const mockedTwMerge = vi.mocked(twMerge);
const mockedIsBefore = vi.mocked(isBefore);
const mockedIsToday = vi.mocked(isToday);
const mockedIsTomorrow = vi.mocked(isTomorrow);
const mockedStartOfToday = vi.mocked(startOfToday);

describe('ui utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('cn', () => {
    it('should combine class names using clsx and twMerge', () => {
      const classNames = ['class1', 'class2'];
      const clsxResult = 'class1 class2';
      const expectedResult = 'merged-class1 merged-class2';

      mockedClsx.mockReturnValue(clsxResult);
      mockedTwMerge.mockReturnValue(expectedResult);

      const result = cn(...classNames);

      expect(mockedClsx).toHaveBeenCalledWith(classNames);
      expect(mockedTwMerge).toHaveBeenCalledWith(clsxResult);
      expect(result).toBe(expectedResult);
    });
  });

  describe('getTaskDueDateColorClass', () => {
    const MOCK_TODAY = new Date('2023-01-15');
    const OVERDUE_DATE = new Date('2023-01-14');
    const TODAY_DATE = new Date('2023-01-15');
    const TOMORROW_DATE = new Date('2023-01-16');
    const FUTURE_DATE = new Date('2023-01-17');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(MOCK_TODAY);
      mockedStartOfToday.mockReturnValue(MOCK_TODAY);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const setupDateMocks = (isBeforeValue: boolean, isTodayValue: boolean, isTomorrowValue: boolean) => {
      mockedIsBefore.mockReturnValue(isBeforeValue);
      mockedIsToday.mockReturnValue(isTodayValue);
      mockedIsTomorrow.mockReturnValue(isTomorrowValue);
    };

    describe('when dueDate is null/undefined', () => {
      it('should return undefined when dueDate is null', () => {
        const dueDate = null;
        const completed = false;

        const result = getTaskDueDateColorClass(dueDate, completed);

        expect(result).toBeUndefined();
      });
    });

    describe('when task is incomplete', () => {
      it('should return red color for overdue tasks', () => {
        setupDateMocks(true, false, false);

        const result = getTaskDueDateColorClass(OVERDUE_DATE, false);

        expect(mockedIsBefore).toHaveBeenCalledWith(OVERDUE_DATE, MOCK_TODAY);
        expect(result).toBe('text-red-500');
      });

      it('should return emerald color for tasks due today', () => {
        setupDateMocks(false, true, false);

        const result = getTaskDueDateColorClass(TODAY_DATE, false);

        expect(mockedIsToday).toHaveBeenCalledWith(TODAY_DATE);
        expect(result).toBe('text-emerald-500');
      });

      it('should return amber color for tasks due tomorrow', () => {
        setupDateMocks(false, false, true);

        const result = getTaskDueDateColorClass(TOMORROW_DATE, false);

        expect(mockedIsTomorrow).toHaveBeenCalledWith(TOMORROW_DATE);
        expect(result).toBe('text-amber-500');
      });

      it('should return undefined for tasks due beyond tomorrow', () => {
        setupDateMocks(false, false, false);

        const result = getTaskDueDateColorClass(FUTURE_DATE, false);

        expect(result).toBeUndefined();
      });
    });

    describe('when task is completed', () => {
      it('should return undefined for tasks due tomorrow', () => {
        setupDateMocks(false, false, true);

        const result = getTaskDueDateColorClass(TOMORROW_DATE, true);

        expect(result).toBeUndefined();
      });
    });
  });

  describe('getBadgeCount', () => {
    const createTaskCounts = (inboxTasks: number, todayTasks: number): TaskCounts => ({
      inboxTasks,
      todayTasks,
    });

    it('should return inbox tasks count for inbox route', () => {
      const taskCounts = createTaskCounts(5, 3);

      const result = getBadgeCount(ROUTES.INBOX, taskCounts);

      expect(result).toBe(5);
    });

    it('should return today tasks count for today route', () => {
      const taskCounts = createTaskCounts(5, 3);

      const result = getBadgeCount(ROUTES.TODAY, taskCounts);

      expect(result).toBe(3);
    });

    it('should return undefined for routes without badge counts', () => {
      const taskCounts = createTaskCounts(5, 3);

      const result = getBadgeCount(ROUTES.UPCOMING, taskCounts);

      expect(result).toBeUndefined();
    });

    it('should return zero when count is zero', () => {
      const taskCounts = createTaskCounts(0, 0);

      const result = getBadgeCount(ROUTES.INBOX, taskCounts);

      expect(result).toBe(0);
    });
  });

  describe('createEmptyState', () => {
    const SRC = '/images/empty.png';
    const WIDTH = 420;
    const TITLE = 'No Data';
    const DESCRIPTION = 'There are no tasks available.';

    it('should return correct empty state structure', () => {
      const expectedHeight = 260;

      const result = createEmptyState(SRC, WIDTH, TITLE, DESCRIPTION);

      expect(result).toEqual({
        img: {
          src: SRC,
          width: WIDTH,
          height: expectedHeight,
        },
        title: TITLE,
        description: DESCRIPTION,
      });
    });

    it('should correctly assign provided values to image and text fields', () => {
      const customSrc = '/random/path.svg';
      const customWidth = 300;
      const customTitle = 'Empty Projects';
      const customDescription = 'You have no active projects yet.';

      const result = createEmptyState(customSrc, customWidth, customTitle, customDescription);

      expect(result.img.src).toBe(customSrc);
      expect(result.img.width).toBe(customWidth);
      expect(result.title).toBe(customTitle);
      expect(result.description).toBe(customDescription);
    });
  });
});
