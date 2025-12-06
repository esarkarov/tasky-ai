import { taskQueries } from '@/features/tasks/repositories/task.queries';
import { Query } from 'appwrite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const mockQuery = vi.mocked(Query);

describe('taskQueries', () => {
  const MOCK_USER_ID = 'user-123';
  const MOCK_TODAY = '2025-01-01T00:00:00.000Z';
  const MOCK_TOMORROW = '2025-01-02T00:00:00.000Z';

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.select.mockReturnValue('select-id');
    mockQuery.equal.mockReturnValue('equal-query');
    mockQuery.isNull.mockReturnValue('is-null');
    mockQuery.isNotNull.mockReturnValue('is-not-null');
    mockQuery.greaterThanEqual.mockReturnValue('greater-than-equal');
    mockQuery.lessThan.mockReturnValue('less-than');
    mockQuery.and.mockReturnValue('and-query');
    mockQuery.orderAsc.mockReturnValue('order-asc');
    mockQuery.orderDesc.mockReturnValue('order-desc');
    mockQuery.limit.mockReturnValue('limit-query');
  });

  describe('selectIdOnly', () => {
    it('should create select query for ID field only', () => {
      const expectedQuery = 'select-query';
      mockQuery.select.mockReturnValue(expectedQuery);

      const result = taskQueries.selectIdOnly();

      expect(mockQuery.select).toHaveBeenCalledWith(['$id']);
      expect(mockQuery.select).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('byUserId', () => {
    it('should create equal query for user ID', () => {
      const expectedQuery = 'equal-user';
      mockQuery.equal.mockReturnValue(expectedQuery);

      const result = taskQueries.byUserId(MOCK_USER_ID);

      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('byCompleted', () => {
    it('should create equal query for completed status', () => {
      const isCompleted = true;
      const expectedQuery = 'equal-completed';
      mockQuery.equal.mockReturnValue(expectedQuery);

      const result = taskQueries.byCompleted(isCompleted);

      expect(mockQuery.equal).toHaveBeenCalledWith('completed', isCompleted);
      expect(mockQuery.equal).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('withoutProject', () => {
    it('should create isNull query for projectId', () => {
      const expectedQuery = 'is-null-project';
      mockQuery.isNull.mockReturnValue(expectedQuery);

      const result = taskQueries.withoutProject();

      expect(mockQuery.isNull).toHaveBeenCalledWith('projectId');
      expect(mockQuery.isNull).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('withDueDate', () => {
    it('should create isNotNull query for due_date', () => {
      const expectedQuery = 'is-not-null-due-date';
      mockQuery.isNotNull.mockReturnValue(expectedQuery);

      const result = taskQueries.withDueDate();

      expect(mockQuery.isNotNull).toHaveBeenCalledWith('due_date');
      expect(mockQuery.isNotNull).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('byDueDateRange', () => {
    it('should create AND query for due date range', () => {
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';
      const greaterThanQuery = 'greater-than';
      const lessThanQuery = 'less-than';
      const andQuery = 'and-query';
      mockQuery.greaterThanEqual.mockReturnValue(greaterThanQuery);
      mockQuery.lessThan.mockReturnValue(lessThanQuery);
      mockQuery.and.mockReturnValue(andQuery);

      const result = taskQueries.byDueDateRange(startDate, endDate);

      expect(mockQuery.greaterThanEqual).toHaveBeenCalledWith('due_date', startDate);
      expect(mockQuery.greaterThanEqual).toHaveBeenCalledOnce();
      expect(mockQuery.lessThan).toHaveBeenCalledWith('due_date', endDate);
      expect(mockQuery.lessThan).toHaveBeenCalledOnce();
      expect(mockQuery.and).toHaveBeenCalledWith([greaterThanQuery, lessThanQuery]);
      expect(mockQuery.and).toHaveBeenCalledOnce();
      expect(result).toBe(andQuery);
    });
  });

  describe('byDueDateFrom', () => {
    it('should create greaterThanEqual query for due date', () => {
      const date = '2025-01-01';
      const expectedQuery = 'greater-than-equal';
      mockQuery.greaterThanEqual.mockReturnValue(expectedQuery);

      const result = taskQueries.byDueDateFrom(date);

      expect(mockQuery.greaterThanEqual).toHaveBeenCalledWith('due_date', date);
      expect(mockQuery.greaterThanEqual).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('orderByDueDateAsc', () => {
    it('should create ascending order query for due_date', () => {
      const expectedQuery = 'order-asc';
      mockQuery.orderAsc.mockReturnValue(expectedQuery);

      const result = taskQueries.orderByDueDateAsc();

      expect(mockQuery.orderAsc).toHaveBeenCalledWith('due_date');
      expect(mockQuery.orderAsc).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('orderByUpdatedDesc', () => {
    it('should create descending order query for $updatedAt', () => {
      const expectedQuery = 'order-desc';
      mockQuery.orderDesc.mockReturnValue(expectedQuery);

      const result = taskQueries.orderByUpdatedDesc();

      expect(mockQuery.orderDesc).toHaveBeenCalledWith('$updatedAt');
      expect(mockQuery.orderDesc).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('limit', () => {
    it('should create limit query with specified count', () => {
      const count = 25;
      const expectedQuery = 'limit-query';
      mockQuery.limit.mockReturnValue(expectedQuery);

      const result = taskQueries.limit(count);

      expect(mockQuery.limit).toHaveBeenCalledWith(count);
      expect(mockQuery.limit).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('forTodayTasks', () => {
    it('should return queries for incomplete tasks due today', () => {
      const result = taskQueries.forTodayTasks(MOCK_TODAY, MOCK_TOMORROW, MOCK_USER_ID);

      expect(result).toEqual(['equal-query', 'equal-query', 'and-query']);
      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledWith('completed', false);
      expect(mockQuery.greaterThanEqual).toHaveBeenCalledWith('due_date', MOCK_TODAY);
      expect(mockQuery.lessThan).toHaveBeenCalledWith('due_date', MOCK_TOMORROW);
    });
  });

  describe('forTodayTasksCount', () => {
    it('should return queries for counting today tasks', () => {
      const result = taskQueries.forTodayTasksCount(MOCK_TODAY, MOCK_TOMORROW, MOCK_USER_ID);

      expect(result).toEqual(['select-id', 'equal-query', 'equal-query', 'and-query', 'limit-query']);
      expect(mockQuery.select).toHaveBeenCalledWith(['$id']);
      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledWith('completed', false);
      expect(mockQuery.limit).toHaveBeenCalledWith(1);
    });
  });

  describe('forInboxTasks', () => {
    it('should return queries for incomplete inbox tasks without project', () => {
      const result = taskQueries.forInboxTasks(MOCK_USER_ID);

      expect(result).toEqual(['equal-query', 'equal-query', 'is-null']);
      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledWith('completed', false);
      expect(mockQuery.isNull).toHaveBeenCalledWith('projectId');
    });
  });

  describe('forInboxTasksCount', () => {
    it('should return queries for counting inbox tasks', () => {
      const result = taskQueries.forInboxTasksCount(MOCK_USER_ID);

      expect(result).toEqual(['select-id', 'equal-query', 'equal-query', 'is-null', 'limit-query']);
      expect(mockQuery.select).toHaveBeenCalledWith(['$id']);
      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledWith('completed', false);
      expect(mockQuery.isNull).toHaveBeenCalledWith('projectId');
      expect(mockQuery.limit).toHaveBeenCalledWith(1);
    });
  });

  describe('forCompletedTasks', () => {
    it('should return queries for completed tasks ordered by update date', () => {
      const result = taskQueries.forCompletedTasks(MOCK_USER_ID);

      expect(result).toEqual(['equal-query', 'equal-query', 'order-desc']);
      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledWith('completed', true);
      expect(mockQuery.orderDesc).toHaveBeenCalledWith('$updatedAt');
    });
  });

  describe('forUpcomingTasks', () => {
    it('should return queries for incomplete upcoming tasks with due dates', () => {
      const result = taskQueries.forUpcomingTasks(MOCK_TODAY, MOCK_USER_ID);

      expect(result).toEqual(['equal-query', 'equal-query', 'is-not-null', 'greater-than-equal', 'order-asc']);
      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledWith('completed', false);
      expect(mockQuery.isNotNull).toHaveBeenCalledWith('due_date');
      expect(mockQuery.greaterThanEqual).toHaveBeenCalledWith('due_date', MOCK_TODAY);
      expect(mockQuery.orderAsc).toHaveBeenCalledWith('due_date');
    });
  });
});
