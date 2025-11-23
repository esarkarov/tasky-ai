import { createMockLoaderArgs, createMockProjects } from '@/core/test-setup/factories';
import { projectService } from '@/features/projects/services/project.service';
import type { ProjectsLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsLoader } from './projects.loader';

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    search: vi.fn(),
  },
}));

const mockedProjectService = vi.mocked(projectService);

describe('projectsLoader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('with search queries', () => {
    it('returns projects when search query is present', async () => {
      const mockProjects = createMockProjects();
      mockedProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(createMockLoaderArgs('http://localhost?q=test'))) as ProjectsLoaderData;

      expect(mockedProjectService.search).toHaveBeenCalledWith('test');
      expect(result).toEqual({ projects: mockProjects });
    });

    it('handles empty search query', async () => {
      const mockProjects = createMockProjects();
      mockedProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(createMockLoaderArgs())) as ProjectsLoaderData;

      expect(mockedProjectService.search).toHaveBeenCalledWith('');
      expect(result).toEqual({ projects: mockProjects });
    });

    it('handles special characters in query', async () => {
      const mockProjects = createMockProjects();
      mockedProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(
        createMockLoaderArgs('http://localhost?q=react+node')
      )) as ProjectsLoaderData;

      expect(mockedProjectService.search).toHaveBeenCalledWith('react node');
      expect(result).toEqual({ projects: mockProjects });
    });

    it('handles multiple query parameters', async () => {
      const mockProjects = createMockProjects();
      mockedProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(
        createMockLoaderArgs('http://localhost?q=test&sort=name&page=1')
      )) as ProjectsLoaderData;

      expect(mockedProjectService.search).toHaveBeenCalledWith('test');
      expect(result).toEqual({ projects: mockProjects });
    });

    it('handles URL with hash and query', async () => {
      const mockProjects = createMockProjects();
      mockedProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(
        createMockLoaderArgs('http://localhost?q=search#section')
      )) as ProjectsLoaderData;

      expect(mockedProjectService.search).toHaveBeenCalledWith('search');
      expect(result).toEqual({ projects: mockProjects });
    });
  });

  describe('when no projects exist', () => {
    it('returns an empty project list', async () => {
      const mockProjects = createMockProjects([]);
      mockedProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(createMockLoaderArgs())) as ProjectsLoaderData;

      expect(mockedProjectService.search).toHaveBeenCalledWith('');
      expect(result).toEqual({ projects: mockProjects });
      expect(result.projects.documents).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('throws when service fails', async () => {
      mockedProjectService.search.mockRejectedValue(new Error('Service error'));

      await expect(projectsLoader(createMockLoaderArgs())).rejects.toThrow('Service error');
      expect(mockedProjectService.search).toHaveBeenCalledWith('');
    });
  });

  describe('data validation', () => {
    it('returns valid ProjectsLoaderData structure', async () => {
      const mockProjects = createMockProjects();
      mockedProjectService.search.mockResolvedValue(mockProjects);

      const result = (await projectsLoader(createMockLoaderArgs())) as ProjectsLoaderData;

      expect(result).toHaveProperty('projects');
      expect(result.projects).toHaveProperty('total', 1);
      expect(result.projects.documents).toHaveLength(1);
    });
  });
});
