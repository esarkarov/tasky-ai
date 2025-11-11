import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskQueries } from './task.queries';
import { Query } from 'appwrite';

vi.mock('appwrite', () => ({
  Query: {
    select: vi.fn(),
    equal: vi.fn(),
    isNull: vi.fn(),
    isNotNull: vi.fn(),
    greaterThanEqual: vi.fn(),
    lessThan: vi.fn(),
    and: vi.fn(),
    orderAsc: vi.fn(),
    orderDesc: vi.fn(),
    limit: vi.fn(),
  },
}));

const mockedQuery = vi.mocked(Query);

describe('taskQueries', () => {
  const MOCK_USER_ID = 'user-123';
  const MOCK_TODAY_DATE = '2023-01-01';
  const MOCK_TOMORROW_DATE = '2023-01-02';

  const setupQueryMocks = () => {
    mockedQuery.select.mockReturnValue('select-id');
    mockedQuery.equal.mockReturnValue('equal-query');
    mockedQuery.isNull.mockReturnValue('is-null');
    mockedQuery.isNotNull.mockReturnValue('is-not-null');
    mockedQuery.greaterThanEqual.mockReturnValue('greater-than-equal');
    mockedQuery.lessThan.mockReturnValue('less-than');
    mockedQuery.and.mockReturnValue('and-query');
    mockedQuery.orderAsc.mockReturnValue('order-asc');
    mockedQuery.orderDesc.mockReturnValue('order-desc');
    mockedQuery.limit.mockReturnValue('limit-query');
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('individual query methods', () => {
    it('should create select query for ID only', () => {
      const mockQuery = 'select-query';
      mockedQuery.select.mockReturnValue(mockQuery);

      const result = taskQueries.selectIdOnly();

      expect(mockedQuery.select).toHaveBeenCalledWith(['$id']);
      expect(result).toBe(mockQuery);
    });

    it('should create equal query for user ID', () => {
      const mockQuery = 'equal-user';
      mockedQuery.equal.mockReturnValue(mockQuery);

      const result = taskQueries.byUserId(MOCK_USER_ID);

      expect(mockedQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(result).toBe(mockQuery);
    });

    it('should create equal query for completion status', () => {
      const isCompleted = true;
      const mockQuery = 'equal-completed';
      mockedQuery.equal.mockReturnValue(mockQuery);

      const result = taskQueries.byCompleted(isCompleted);

      expect(mockedQuery.equal).toHaveBeenCalledWith('completed', isCompleted);
      expect(result).toBe(mockQuery);
    });

    it('should create isNull query for null projectId', () => {
      const mockQuery = 'is-null-project';
      mockedQuery.isNull.mockReturnValue(mockQuery);

      const result = taskQueries.withoutProject();

      expect(mockedQuery.isNull).toHaveBeenCalledWith('projectId');
      expect(result).toBe(mockQuery);
    });

    it('should create isNotNull query for due_date', () => {
      const mockQuery = 'is-not-null-due-date';
      mockedQuery.isNotNull.mockReturnValue(mockQuery);

      const result = taskQueries.withDueDate();

      expect(mockedQuery.isNotNull).toHaveBeenCalledWith('due_date');
      expect(result).toBe(mockQuery);
    });

    it('should create and query for due date range', () => {
      const startDate = '2023-01-01';
      const endDate = '2023-01-02';
      const mockGreaterThan = 'greater-than';
      const mockLessThan = 'less-than';
      const mockAnd = 'and-query';
      mockedQuery.greaterThanEqual.mockReturnValue(mockGreaterThan);
      mockedQuery.lessThan.mockReturnValue(mockLessThan);
      mockedQuery.and.mockReturnValue(mockAnd);

      const result = taskQueries.byDueDateRange(startDate, endDate);

      expect(mockedQuery.greaterThanEqual).toHaveBeenCalledWith('due_date', startDate);
      expect(mockedQuery.lessThan).toHaveBeenCalledWith('due_date', endDate);
      expect(mockedQuery.and).toHaveBeenCalledWith([mockGreaterThan, mockLessThan]);
      expect(result).toBe(mockAnd);
    });

    it('should create greaterThanEqual query for due date from', () => {
      const date = '2023-01-01';
      const mockQuery = 'greater-than-equal';
      mockedQuery.greaterThanEqual.mockReturnValue(mockQuery);

      const result = taskQueries.byDueDateFrom(date);

      expect(mockedQuery.greaterThanEqual).toHaveBeenCalledWith('due_date', date);
      expect(result).toBe(mockQuery);
    });

    it('should create orderAsc query for due_date', () => {
      const mockQuery = 'order-asc';
      mockedQuery.orderAsc.mockReturnValue(mockQuery);

      const result = taskQueries.orderByDueDateAsc();

      expect(mockedQuery.orderAsc).toHaveBeenCalledWith('due_date');
      expect(result).toBe(mockQuery);
    });

    it('should create orderDesc query for $updatedAt', () => {
      const mockQuery = 'order-desc';
      mockedQuery.orderDesc.mockReturnValue(mockQuery);

      const result = taskQueries.orderByUpdatedDesc();

      expect(mockedQuery.orderDesc).toHaveBeenCalledWith('$updatedAt');
      expect(result).toBe(mockQuery);
    });

    it('should create limit query', () => {
      const count = 10;
      const mockQuery = 'limit-query';
      mockedQuery.limit.mockReturnValue(mockQuery);

      const result = taskQueries.limit(count);

      expect(mockedQuery.limit).toHaveBeenCalledWith(count);
      expect(result).toBe(mockQuery);
    });
  });

  describe('composite query methods', () => {
    beforeEach(() => {
      setupQueryMocks();
    });

    describe('forTodayTasks', () => {
      it('should return queries for today incomplete tasks', () => {
        const result = taskQueries.forTodayTasks(MOCK_TODAY_DATE, MOCK_TOMORROW_DATE, MOCK_USER_ID);

        expect(result).toEqual(['equal-query', 'equal-query', 'and-query']);
        expect(mockedQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
        expect(mockedQuery.equal).toHaveBeenCalledWith('completed', false);
      });
    });

    describe('forTodayTasksCount', () => {
      it('should return queries for today task count', () => {
        const result = taskQueries.forTodayTasksCount(MOCK_TODAY_DATE, MOCK_TOMORROW_DATE, MOCK_USER_ID);

        expect(result).toEqual(['select-id', 'equal-query', 'equal-query', 'and-query', 'limit-query']);
        expect(mockedQuery.select).toHaveBeenCalledWith(['$id']);
        expect(mockedQuery.limit).toHaveBeenCalledWith(1);
      });
    });

    describe('forInboxTasks', () => {
      it('should return queries for inbox incomplete tasks', () => {
        const result = taskQueries.forInboxTasks(MOCK_USER_ID);

        expect(result).toEqual(['equal-query', 'equal-query', 'is-null']);
        expect(mockedQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
        expect(mockedQuery.equal).toHaveBeenCalledWith('completed', false);
        expect(mockedQuery.isNull).toHaveBeenCalledWith('projectId');
      });
    });

    describe('forInboxTasksCount', () => {
      it('should return queries for inbox task count', () => {
        const result = taskQueries.forInboxTasksCount(MOCK_USER_ID);

        expect(result).toEqual(['select-id', 'equal-query', 'equal-query', 'is-null', 'limit-query']);
        expect(mockedQuery.select).toHaveBeenCalledWith(['$id']);
        expect(mockedQuery.limit).toHaveBeenCalledWith(1);
      });
    });

    describe('forCompletedTasks', () => {
      it('should return queries for completed tasks', () => {
        const result = taskQueries.forCompletedTasks(MOCK_USER_ID);

        expect(result).toEqual(['equal-query', 'equal-query', 'order-desc']);
        expect(mockedQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
        expect(mockedQuery.equal).toHaveBeenCalledWith('completed', true);
        expect(mockedQuery.orderDesc).toHaveBeenCalledWith('$updatedAt');
      });
    });

    describe('forUpcomingTasks', () => {
      it('should return queries for upcoming incomplete tasks', () => {
        const result = taskQueries.forUpcomingTasks(MOCK_TODAY_DATE, MOCK_USER_ID);

        expect(result).toEqual(['equal-query', 'equal-query', 'is-not-null', 'greater-than-equal', 'order-asc']);
        expect(mockedQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
        expect(mockedQuery.equal).toHaveBeenCalledWith('completed', false);
        expect(mockedQuery.isNotNull).toHaveBeenCalledWith('due_date');
        expect(mockedQuery.greaterThanEqual).toHaveBeenCalledWith('due_date', MOCK_TODAY_DATE);
        expect(mockedQuery.orderAsc).toHaveBeenCalledWith('due_date');
      });
    });
  });
});
