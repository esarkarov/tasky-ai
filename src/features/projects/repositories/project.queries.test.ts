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

const mockQuery = vi.mocked(Query);

describe('projectQueries', () => {
  const MOCK_USER_ID = 'user-123';
  const PROJECT_LIST_FIELDS = ['$id', 'name', 'color_name', 'color_hex', '$createdAt'];

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default return values for chaining
    mockQuery.select.mockReturnValue('select-fields');
    mockQuery.equal.mockReturnValue('by-user');
    mockQuery.orderDesc.mockReturnValue('order-desc');
    mockQuery.contains.mockReturnValue('search-query');
    mockQuery.limit.mockReturnValue('limit-query');
  });

  describe('selectListFields', () => {
    it('should create select query with project list fields', () => {
      // Arrange
      const expectedQuery = 'select-fields';
      mockQuery.select.mockReturnValue(expectedQuery);

      // Act
      const result = projectQueries.selectListFields();

      // Assert
      expect(mockQuery.select).toHaveBeenCalledWith(PROJECT_LIST_FIELDS);
      expect(mockQuery.select).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('byUserId', () => {
    it('should create equal query for user ID', () => {
      // Arrange
      const expectedQuery = 'equal-user';
      mockQuery.equal.mockReturnValue(expectedQuery);

      // Act
      const result = projectQueries.byUserId(MOCK_USER_ID);

      // Assert
      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('searchByName', () => {
    it('should create contains query for name search', () => {
      // Arrange
      const searchTerm = 'my project';
      const expectedQuery = 'contains-query';
      mockQuery.contains.mockReturnValue(expectedQuery);

      // Act
      const result = projectQueries.searchByName(searchTerm);

      // Assert
      expect(mockQuery.contains).toHaveBeenCalledWith('name', searchTerm);
      expect(mockQuery.contains).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('orderByCreatedDesc', () => {
    it('should create descending order query for creation date', () => {
      // Arrange
      const expectedQuery = 'order-desc';
      mockQuery.orderDesc.mockReturnValue(expectedQuery);

      // Act
      const result = projectQueries.orderByCreatedDesc();

      // Assert
      expect(mockQuery.orderDesc).toHaveBeenCalledWith('$createdAt');
      expect(mockQuery.orderDesc).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('limit', () => {
    it('should create limit query with specified count', () => {
      // Arrange
      const limitCount = 10;
      const expectedQuery = 'limit-query';
      mockQuery.limit.mockReturnValue(expectedQuery);

      // Act
      const result = projectQueries.limit(limitCount);

      // Assert
      expect(mockQuery.limit).toHaveBeenCalledWith(limitCount);
      expect(mockQuery.limit).toHaveBeenCalledOnce();
      expect(result).toBe(expectedQuery);
    });
  });

  describe('forUserProjectsList', () => {
    it('should return base queries without options', () => {
      // Arrange & Act
      const result = projectQueries.forUserProjectsList(MOCK_USER_ID);

      // Assert
      expect(result).toEqual(['select-fields', 'by-user', 'order-desc']);
      expect(mockQuery.select).toHaveBeenCalledWith(PROJECT_LIST_FIELDS);
      expect(mockQuery.select).toHaveBeenCalledOnce();
      expect(mockQuery.equal).toHaveBeenCalledWith('userId', MOCK_USER_ID);
      expect(mockQuery.equal).toHaveBeenCalledOnce();
      expect(mockQuery.orderDesc).toHaveBeenCalledWith('$createdAt');
      expect(mockQuery.orderDesc).toHaveBeenCalledOnce();
    });

    it('should include search query when search term is provided', () => {
      // Arrange
      const searchTerm = 'website';

      // Act
      const result = projectQueries.forUserProjectsList(MOCK_USER_ID, { search: searchTerm });

      // Assert
      expect(result).toEqual(['select-fields', 'by-user', 'order-desc', 'search-query']);
      expect(mockQuery.contains).toHaveBeenCalledWith('name', searchTerm);
      expect(mockQuery.contains).toHaveBeenCalledOnce();
    });

    it('should include limit query when limit is provided', () => {
      // Arrange
      const limitCount = 15;

      // Act
      const result = projectQueries.forUserProjectsList(MOCK_USER_ID, { limit: limitCount });

      // Assert
      expect(result).toEqual(['select-fields', 'by-user', 'order-desc', 'limit-query']);
      expect(mockQuery.limit).toHaveBeenCalledWith(limitCount);
      expect(mockQuery.limit).toHaveBeenCalledOnce();
    });

    it('should include both search and limit queries when both are provided', () => {
      // Arrange
      const searchTerm = 'mobile app';
      const limitCount = 5;

      // Act
      const result = projectQueries.forUserProjectsList(MOCK_USER_ID, {
        search: searchTerm,
        limit: limitCount,
      });

      // Assert
      expect(result).toEqual(['select-fields', 'by-user', 'order-desc', 'search-query', 'limit-query']);
      expect(mockQuery.contains).toHaveBeenCalledWith('name', searchTerm);
      expect(mockQuery.contains).toHaveBeenCalledOnce();
      expect(mockQuery.limit).toHaveBeenCalledWith(limitCount);
      expect(mockQuery.limit).toHaveBeenCalledOnce();
    });

    it('should exclude search query when search term is empty', () => {
      // Arrange & Act
      const result = projectQueries.forUserProjectsList(MOCK_USER_ID, { search: '' });

      // Assert
      expect(result).toEqual(['select-fields', 'by-user', 'order-desc']);
      expect(mockQuery.contains).not.toHaveBeenCalled();
    });
  });
});
