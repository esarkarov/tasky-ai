import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectQueries } from './project.queries';
import { Query } from 'appwrite';

vi.mock('appwrite', () => ({
  Query: {
    select: vi.fn(),
    equal: vi.fn(),
    contains: vi.fn(),
    orderDesc: vi.fn(),
    limit: vi.fn(),
  },
}));

const mockedQuery = vi.mocked(Query);

describe('projectQueries', () => {
  const MOCK_USER_ID = 'user-123';
  const PROJECT_LIST_FIELDS = ['$id', 'name', 'color_name', 'color_hex', '$createdAt'];

  const setupQueryMocks = () => {
    mockedQuery.select.mockReturnValue('select-fields');
    mockedQuery.equal.mockReturnValue('by-user');
    mockedQuery.orderDesc.mockReturnValue('order-desc');
    mockedQuery.contains.mockReturnValue('search-query');
    mockedQuery.limit.mockReturnValue('limit-query');
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('individual query methods', () => {
    it('should create select query for list fields', () => {
      const mockQuery = 'select-query';
      mockedQuery.select.mockReturnValue(mockQuery);

      const result = projectQueries.selectListFields();

      expect(mockedQuery.select).toHaveBeenCalledWith(PROJECT_LIST_FIELDS);
      expect(result).toBe(mockQuery);
    });

    it('should create equal query for user ID', () => {
      const mockQuery = 'equal-user';
      mockedQuery.equal.mockReturnValue(mockQuery);

      const result = projectQueries.byUserId(MOCK_USER_ID);

      expect(mockedQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(result).toBe(mockQuery);
    });

    it('should create contains query for name search', () => {
      const searchTerm = 'test project';
      const mockQuery = 'contains-query';
      mockedQuery.contains.mockReturnValue(mockQuery);

      const result = projectQueries.searchByName(searchTerm);

      expect(mockedQuery.contains).toHaveBeenCalledWith('name', searchTerm);
      expect(result).toBe(mockQuery);
    });

    it('should create orderDesc query for creation date', () => {
      const mockQuery = 'order-desc';
      mockedQuery.orderDesc.mockReturnValue(mockQuery);

      const result = projectQueries.orderByCreatedDesc();

      expect(mockedQuery.orderDesc).toHaveBeenCalledWith('$createdAt');
      expect(result).toBe(mockQuery);
    });

    it('should create limit query', () => {
      const count = 5;
      const mockQuery = 'limit-query';
      mockedQuery.limit.mockReturnValue(mockQuery);

      const result = projectQueries.limit(count);

      expect(mockedQuery.limit).toHaveBeenCalledWith(count);
      expect(result).toBe(mockQuery);
    });
  });

  describe('forUserProjectsList', () => {
    beforeEach(() => {
      setupQueryMocks();
    });

    it('should return base queries without options', () => {
      const result = projectQueries.forUserProjectsList(MOCK_USER_ID);

      expect(result).toEqual(['select-fields', 'by-user', 'order-desc']);
      expect(mockedQuery.select).toHaveBeenCalledWith(PROJECT_LIST_FIELDS);
      expect(mockedQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockedQuery.orderDesc).toHaveBeenCalledWith('$createdAt');
    });

    it('should include search query when search term provided', () => {
      const searchTerm = 'test';

      const result = projectQueries.forUserProjectsList(MOCK_USER_ID, { search: searchTerm });

      expect(result).toEqual(['select-fields', 'by-user', 'order-desc', 'search-query']);
      expect(mockedQuery.contains).toHaveBeenCalledWith('name', searchTerm);
    });

    it('should include limit query when limit provided', () => {
      const limit = 10;

      const result = projectQueries.forUserProjectsList(MOCK_USER_ID, { limit });

      expect(result).toEqual(['select-fields', 'by-user', 'order-desc', 'limit-query']);
      expect(mockedQuery.limit).toHaveBeenCalledWith(limit);
    });

    it('should include both search and limit queries when both provided', () => {
      const searchTerm = 'test';
      const limit = 5;

      const result = projectQueries.forUserProjectsList(MOCK_USER_ID, { search: searchTerm, limit });

      expect(result).toEqual(['select-fields', 'by-user', 'order-desc', 'search-query', 'limit-query']);
      expect(mockedQuery.contains).toHaveBeenCalledWith('name', searchTerm);
      expect(mockedQuery.limit).toHaveBeenCalledWith(limit);
    });

    it('should exclude search query when search term is empty', () => {
      const result = projectQueries.forUserProjectsList(MOCK_USER_ID, { search: '' });

      expect(result).toEqual(['select-fields', 'by-user', 'order-desc']);
      expect(mockedQuery.contains).not.toHaveBeenCalled();
    });
  });
});
