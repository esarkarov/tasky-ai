import { env } from '@/core/config/env.config';
import { databases } from '@/core/lib/appwrite';
import { createMockProject, createMockProjects } from '@/core/test-setup/factories';
import { projectQueries } from '@/features/projects/repositories/project.queries';
import { projectRepository } from '@/features/projects/repositories/project.repository';
import type { ProjectCreateInput, ProjectUpdateInput } from '@/features/projects/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/lib/appwrite', () => ({
  databases: {
    getDocument: vi.fn(),
    listDocuments: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

vi.mock('@/core/config/env.config', () => ({
  env: {
    appwriteDatabaseId: 'test-database',
    appwriteProjectsCollectionId: 'test-projects',
  },
}));

vi.mock('@/features/projects/repositories/project.queries', () => ({
  projectQueries: {
    forUserProjectsList: vi.fn(),
  },
}));

const mockDatabases = vi.mocked(databases);
const mockProjectQueries = vi.mocked(projectQueries);

describe('projectRepository', () => {
  const MOCK_DATABASE_ID = 'test-database';
  const MOCK_COLLECTION_ID = 'test-projects';
  const MOCK_PROJECT_ID = 'project-123';
  const MOCK_USER_ID = 'user-456';
  const MOCK_QUERIES = ['query1', 'query2'];

  beforeEach(() => {
    vi.clearAllMocks();
    env.appwriteDatabaseId = MOCK_DATABASE_ID;
    env.appwriteProjectsCollectionId = MOCK_COLLECTION_ID;
  });

  describe('findById', () => {
    it('should return project when document exists', async () => {
      const mockProject = createMockProject();
      mockDatabases.getDocument.mockResolvedValue(mockProject);

      const result = await projectRepository.findById(MOCK_PROJECT_ID);

      expect(mockDatabases.getDocument).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_PROJECT_ID);
      expect(mockDatabases.getDocument).toHaveBeenCalledOnce();
      expect(result).toEqual(mockProject);
    });

    it('should throw error when document is not found', async () => {
      mockDatabases.getDocument.mockRejectedValue(new Error('Document not found'));

      await expect(projectRepository.findById(MOCK_PROJECT_ID)).rejects.toThrow('Document not found');
      expect(mockDatabases.getDocument).toHaveBeenCalledOnce();
    });
  });

  describe('findByUserId', () => {
    it('should return user projects without filter options', async () => {
      const mockProjects = createMockProjects();
      mockProjectQueries.forUserProjectsList.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue(mockProjects);

      const result = await projectRepository.findByUserId(MOCK_USER_ID);

      expect(mockProjectQueries.forUserProjectsList).toHaveBeenCalledWith(MOCK_USER_ID, undefined);
      expect(mockProjectQueries.forUserProjectsList).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
      expect(result).toEqual(mockProjects);
    });

    it('should return user projects with search filter', async () => {
      const searchQuery = 'website project';
      const mockProjects = createMockProjects();
      mockProjectQueries.forUserProjectsList.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue(mockProjects);

      const result = await projectRepository.findByUserId(MOCK_USER_ID, { search: searchQuery });

      expect(mockProjectQueries.forUserProjectsList).toHaveBeenCalledWith(MOCK_USER_ID, { search: searchQuery });
      expect(mockProjectQueries.forUserProjectsList).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(result).toEqual(mockProjects);
    });

    it('should return user projects with limit filter', async () => {
      const limit = 10;
      const mockProjects = createMockProjects();
      mockProjectQueries.forUserProjectsList.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue(mockProjects);

      const result = await projectRepository.findByUserId(MOCK_USER_ID, { limit });

      expect(mockProjectQueries.forUserProjectsList).toHaveBeenCalledWith(MOCK_USER_ID, { limit });
      expect(mockProjectQueries.forUserProjectsList).toHaveBeenCalledOnce();
      expect(mockDatabases.listDocuments).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_QUERIES);
      expect(result).toEqual(mockProjects);
    });

    it('should return user projects with both search and limit filters', async () => {
      const searchQuery = 'mobile app';
      const limit = 5;
      const mockProjects = createMockProjects();
      mockProjectQueries.forUserProjectsList.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockResolvedValue(mockProjects);

      const result = await projectRepository.findByUserId(MOCK_USER_ID, { search: searchQuery, limit });

      expect(mockProjectQueries.forUserProjectsList).toHaveBeenCalledWith(MOCK_USER_ID, { search: searchQuery, limit });
      expect(result).toEqual(mockProjects);
    });

    it('should throw error when query fails', async () => {
      mockProjectQueries.forUserProjectsList.mockReturnValue(MOCK_QUERIES);
      mockDatabases.listDocuments.mockRejectedValue(new Error('Database connection failed'));

      await expect(projectRepository.findByUserId(MOCK_USER_ID)).rejects.toThrow('Database connection failed');
      expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
    });
  });

  describe('create', () => {
    it('should create project with provided data', async () => {
      const createData: ProjectCreateInput = {
        name: 'New Project',
        color_name: 'blue',
        color_hex: '#0000FF',
        userId: MOCK_USER_ID,
      };
      const createdProject = createMockProject(createData);
      mockDatabases.createDocument.mockResolvedValue(createdProject);

      const result = await projectRepository.create(MOCK_PROJECT_ID, createData);

      expect(mockDatabases.createDocument).toHaveBeenCalledWith(
        MOCK_DATABASE_ID,
        MOCK_COLLECTION_ID,
        MOCK_PROJECT_ID,
        createData
      );
      expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
      expect(result).toEqual(createdProject);
    });

    it('should throw error when creation fails', async () => {
      const createData: ProjectCreateInput = {
        name: 'New Project',
        color_name: 'blue',
        color_hex: '#0000FF',
        userId: MOCK_USER_ID,
      };
      mockDatabases.createDocument.mockRejectedValue(new Error('Unique constraint violation'));

      await expect(projectRepository.create(MOCK_PROJECT_ID, createData)).rejects.toThrow(
        'Unique constraint violation'
      );
      expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update project with provided data', async () => {
      const updateData: ProjectUpdateInput = {
        name: 'Updated Project Name',
        color_name: 'green',
        color_hex: '#00FF00',
      };
      const updatedProject = createMockProject(updateData);
      mockDatabases.updateDocument.mockResolvedValue(updatedProject);

      const result = await projectRepository.update(MOCK_PROJECT_ID, updateData);

      expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
        MOCK_DATABASE_ID,
        MOCK_COLLECTION_ID,
        MOCK_PROJECT_ID,
        updateData
      );
      expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
      expect(result).toEqual(updatedProject);
    });

    it('should throw error when update fails', async () => {
      const updateData: ProjectUpdateInput = {
        name: 'Updated Project Name',
        color_name: 'green',
        color_hex: '#00FF00',
      };
      mockDatabases.updateDocument.mockRejectedValue(new Error('Project not found'));

      await expect(projectRepository.update(MOCK_PROJECT_ID, updateData)).rejects.toThrow('Project not found');
      expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should delete project successfully', async () => {
      mockDatabases.deleteDocument.mockResolvedValue({});

      await projectRepository.delete(MOCK_PROJECT_ID);

      expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(MOCK_DATABASE_ID, MOCK_COLLECTION_ID, MOCK_PROJECT_ID);
      expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
    });

    it('should throw error when deletion fails', async () => {
      mockDatabases.deleteDocument.mockRejectedValue(new Error('Foreign key constraint'));

      await expect(projectRepository.delete(MOCK_PROJECT_ID)).rejects.toThrow('Foreign key constraint');
      expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
    });
  });
});
