import { createMockLoaderArgs, createMockProject, createMockProjects } from '@/core/test-setup/factories';
import { projectDetailLoader } from '@/features/projects/router/loaders/project-detail/project-detail.loader';
import { projectService } from '@/features/projects/services/project.service';
import type { ProjectDetailWithRecentLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    findById: vi.fn(),
    findRecent: vi.fn(),
  },
}));

const mockProjectService = vi.mocked(projectService);

describe('projectDetailLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful data loading', () => {
    it('should return project details and recent projects when projectId is valid', async () => {
      const mockProject = createMockProject();
      const mockProjects = createMockProjects();
      mockProjectService.findById.mockResolvedValue(mockProject);
      mockProjectService.findRecent.mockResolvedValue(mockProjects);

      const result = (await projectDetailLoader(
        createMockLoaderArgs('http://localhost', mockProject.$id)
      )) as ProjectDetailWithRecentLoaderData;

      expect(result).toEqual({
        project: mockProject,
        projects: mockProjects,
      });
      expect(mockProjectService.findById).toHaveBeenCalledWith(mockProject.$id);
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
    });

    it('should handle different project IDs correctly', async () => {
      const customProject = createMockProject({ $id: 'custom-id-123', name: 'Custom Project' });
      const recentProjects = createMockProjects([customProject]);
      mockProjectService.findById.mockResolvedValue(customProject);
      mockProjectService.findRecent.mockResolvedValue(recentProjects);

      const result = (await projectDetailLoader(
        createMockLoaderArgs('http://localhost', 'custom-id-123')
      )) as ProjectDetailWithRecentLoaderData;

      expect(result.project.$id).toBe('custom-id-123');
      expect(result.project.name).toBe('Custom Project');
      expect(mockProjectService.findById).toHaveBeenCalledWith('custom-id-123');
    });
  });

  describe('error handling', () => {
    it('should throw error when projectId is missing or invalid', async () => {
      mockProjectService.findById.mockRejectedValue(new Error('Project ID is required'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(projectDetailLoader(createMockLoaderArgs('http://localhost', undefined))).rejects.toThrow(
        'Project ID is required'
      );
    });

    it('should throw error when project lookup fails', async () => {
      mockProjectService.findById.mockRejectedValue(new Error('Project not found'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(projectDetailLoader(createMockLoaderArgs('http://localhost', 'non-existent-id'))).rejects.toThrow(
        'Project not found'
      );
    });

    it('should throw error when recent projects fetch fails', async () => {
      const mockProject = createMockProject();
      mockProjectService.findById.mockResolvedValue(mockProject);
      mockProjectService.findRecent.mockRejectedValue(new Error('Failed to fetch recent projects'));

      await expect(projectDetailLoader(createMockLoaderArgs('http://localhost', mockProject.$id))).rejects.toThrow(
        'Failed to fetch recent projects'
      );
    });
  });
});
