import { createMockLoaderArgs, createMockProject, createMockProjects } from '@/core/tests/factories';
import { projectService } from '@/features/projects/services/project.service';
import type { ProjectDetailLoaderData, ProjectDetailWithRecentLoaderData } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectDetailLoader } from './project-detail.loader';

vi.mock('@/features/projects/services/project.service', () => ({
  projectService: {
    findById: vi.fn(),
    findRecent: vi.fn(),
  },
}));

const mockProjectService = vi.mocked(projectService);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('projectDetailLoader', () => {
  describe('success cases', () => {
    it('returns project and recent projects when projectId is valid', async () => {
      const project = createMockProject();
      const projectsList = createMockProjects();

      mockProjectService.findById.mockResolvedValue(project);
      mockProjectService.findRecent.mockResolvedValue(projectsList);

      const result = (await projectDetailLoader(
        createMockLoaderArgs('http://localhost', project.$id)
      )) as ProjectDetailLoaderData;

      expect(mockProjectService.findById).toHaveBeenCalledWith(project.$id);
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(result).toEqual({ project, projects: projectsList });
    });

    it('handles different project IDs correctly', async () => {
      const customProject = createMockProject({ $id: 'other-id', name: 'Custom' });
      const projectsList = createMockProjects([customProject]);

      mockProjectService.findById.mockResolvedValue(customProject);
      mockProjectService.findRecent.mockResolvedValue(projectsList);

      const result = (await projectDetailLoader(
        createMockLoaderArgs('http://localhost', 'other-id')
      )) as ProjectDetailWithRecentLoaderData;

      expect(result.project.$id).toBe('other-id');
      expect(result.project.name).toBe('Custom');
      expect(result.projects.documents[0].$id).toBe('other-id');
    });

    it('returns valid ProjectDetailLoaderData shape', async () => {
      const project = createMockProject();
      const projects = createMockProjects([project]);

      mockProjectService.findById.mockResolvedValue(project);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await projectDetailLoader(
        createMockLoaderArgs('http://localhost', project.$id)
      )) as ProjectDetailWithRecentLoaderData;

      expect(result).toHaveProperty('project');
      expect(result).toHaveProperty('projects');
      expect(Array.isArray(result.projects.documents)).toBe(true);
      expect(result.project).toEqual(project);
    });
  });

  describe('error handling', () => {
    it('throws if projectId is missing', async () => {
      mockProjectService.findById.mockRejectedValue(new Error('Project ID is required'));

      await expect(projectDetailLoader(createMockLoaderArgs('http://localhost', undefined))).rejects.toThrow(
        'Project ID is required'
      );
    });

    it('throws if findById fails', async () => {
      mockProjectService.findById.mockRejectedValue(new Error('Failed to fetch project'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(projectDetailLoader(createMockLoaderArgs('http://localhost', 'invalid'))).rejects.toThrow(
        'Failed to fetch project'
      );
    });

    it('throws if findRecent fails', async () => {
      const project = createMockProject();
      mockProjectService.findById.mockResolvedValue(project);
      mockProjectService.findRecent.mockRejectedValue(new Error('Failed to fetch projects'));

      await expect(projectDetailLoader(createMockLoaderArgs('http://localhost', project.$id))).rejects.toThrow(
        'Failed to fetch projects'
      );
    });
  });
});
