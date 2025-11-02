import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectDetailLoader } from './project-detail.loader';
import { projectService } from '@/services/project/project.service';
import type { ProjectEntity, ProjectsListResponse } from '@/types/projects.types';
import type { ProjectDetailLoaderData, ProjectDetailWithRecentLoaderData } from '@/types/loaders.types';

vi.mock('@/services/project/project.service', () => ({
  projectService: {
    getProjectById: vi.fn(),
    getRecentProjects: vi.fn(),
  },
}));

const mockProjectService = vi.mocked(projectService);

const createLoaderArgs = (projectId?: string) => ({
  params: { projectId },
  request: new Request('http://localhost'),
  context: {},
});

const createMockProject = (overrides: Partial<ProjectEntity> = {}): ProjectEntity => ({
  $id: 'project-123',
  name: 'Test Project',
  description: 'A test project',
  userId: 'user-1',
  color_name: 'blue',
  color_hex: '#0000FF',
  tasks: [],
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $collectionId: 'projects',
  $databaseId: 'default',
  $permissions: [],
  ...overrides,
});

const createMockProjects = (projects: ProjectEntity[] = [createMockProject()]): ProjectsListResponse => ({
  total: projects.length,
  documents: projects,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('projectDetailLoader', () => {
  describe('success cases', () => {
    it('returns project and recent projects when projectId is valid', async () => {
      const project = createMockProject();
      const projectsList = createMockProjects();

      mockProjectService.getProjectById.mockResolvedValue(project);
      mockProjectService.getRecentProjects.mockResolvedValue(projectsList);

      const result = (await projectDetailLoader(createLoaderArgs(project.$id))) as ProjectDetailLoaderData;

      expect(mockProjectService.getProjectById).toHaveBeenCalledWith(project.$id);
      expect(mockProjectService.getRecentProjects).toHaveBeenCalledOnce();
      expect(result).toEqual({ project, projects: projectsList });
    });

    it('handles different project IDs correctly', async () => {
      const customProject = createMockProject({ $id: 'other-id', name: 'Custom' });
      const projectsList = createMockProjects([customProject]);

      mockProjectService.getProjectById.mockResolvedValue(customProject);
      mockProjectService.getRecentProjects.mockResolvedValue(projectsList);

      const result = (await projectDetailLoader(createLoaderArgs('other-id'))) as ProjectDetailWithRecentLoaderData;

      expect(result.project.$id).toBe('other-id');
      expect(result.project.name).toBe('Custom');
      expect(result.projects.documents[0].$id).toBe('other-id');
    });

    it('returns valid ProjectDetailLoaderData shape', async () => {
      const project = createMockProject();
      const projects = createMockProjects([project]);

      mockProjectService.getProjectById.mockResolvedValue(project);
      mockProjectService.getRecentProjects.mockResolvedValue(projects);

      const result = (await projectDetailLoader(createLoaderArgs(project.$id))) as ProjectDetailWithRecentLoaderData;

      expect(result).toHaveProperty('project');
      expect(result).toHaveProperty('projects');
      expect(Array.isArray(result.projects.documents)).toBe(true);
      expect(result.project).toEqual(project);
    });
  });

  describe('error handling', () => {
    it('throws if projectId is missing', async () => {
      mockProjectService.getProjectById.mockRejectedValue(new Error('Project ID is required'));

      await expect(projectDetailLoader(createLoaderArgs(undefined))).rejects.toThrow('Project ID is required');
    });

    it('throws if getProjectById fails', async () => {
      mockProjectService.getProjectById.mockRejectedValue(new Error('Failed to fetch project'));
      mockProjectService.getRecentProjects.mockResolvedValue(createMockProjects());

      await expect(projectDetailLoader(createLoaderArgs('invalid'))).rejects.toThrow('Failed to fetch project');
    });

    it('throws if getRecentProjects fails', async () => {
      const project = createMockProject();
      mockProjectService.getProjectById.mockResolvedValue(project);
      mockProjectService.getRecentProjects.mockRejectedValue(new Error('Failed to fetch projects'));

      await expect(projectDetailLoader(createLoaderArgs(project.$id))).rejects.toThrow('Failed to fetch projects');
    });
  });
});
