import { createMockLoaderArgs, createMockProjects } from '@/core/test-setup/factories';
import { projectsLoader } from '@/features/projects/router/loaders/projects/projects.loader';
import { projectService } from '@/features/projects/services/project.service';
import type { ProjectsLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    search: vi.fn(),
  },
}));

const mockProjectService = vi.mocked(projectService);

describe('projectsLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('search query handling', () => {
    it('should search projects with provided query parameter', async () => {
      const mockProjects = createMockProjects();
      mockProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(createMockLoaderArgs('http://localhost?q=test'))) as ProjectsLoaderData;

      expect(mockProjectService.search).toHaveBeenCalledWith('test');
      expect(result).toEqual({ projects: mockProjects });
    });

    it('should search with empty string when no query parameter provided', async () => {
      const mockProjects = createMockProjects();
      mockProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(createMockLoaderArgs())) as ProjectsLoaderData;

      expect(mockProjectService.search).toHaveBeenCalledWith('');
      expect(result).toEqual({ projects: mockProjects });
    });

    it('should decode URL-encoded query parameters', async () => {
      const mockProjects = createMockProjects();
      mockProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(
        createMockLoaderArgs('http://localhost?q=react+node')
      )) as ProjectsLoaderData;

      expect(mockProjectService.search).toHaveBeenCalledWith('react node');
      expect(result).toEqual({ projects: mockProjects });
    });

    it('should extract only query parameter from URL with multiple parameters', async () => {
      const mockProjects = createMockProjects();
      mockProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(
        createMockLoaderArgs('http://localhost?q=test&sort=name&page=1')
      )) as ProjectsLoaderData;

      expect(mockProjectService.search).toHaveBeenCalledWith('test');
      expect(result).toEqual({ projects: mockProjects });
    });
  });

  describe('empty results handling', () => {
    it('should return empty projects list when no results found', async () => {
      const emptyProjects = createMockProjects([]);
      mockProjectService.search.mockResolvedValue(emptyProjects);

      const result = (await projectsLoader(createMockLoaderArgs())) as ProjectsLoaderData;

      expect(result.projects.total).toBe(0);
      expect(result.projects.documents).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should throw error when project service fails', async () => {
      mockProjectService.search.mockRejectedValue(new Error('Search service failed'));

      await expect(projectsLoader(createMockLoaderArgs())).rejects.toThrow('Search service failed');
      expect(mockProjectService.search).toHaveBeenCalledWith('');
    });
  });
});
