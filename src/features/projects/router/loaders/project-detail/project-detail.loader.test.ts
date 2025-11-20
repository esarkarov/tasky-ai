import { projectService } from '@/features/projects/services/project.service';
import type { Project, ProjectsListResponse } from '@/features/projects/types';
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

const createLoaderArgs = (projectId?: string) => ({
  request: new Request('http://localhost'),
  params: { projectId },
  context: {},
  unstable_pattern: '',
});

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
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

const createMockProjects = (projects: Project[] = [createMockProject()]): ProjectsListResponse => ({
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

      mockProjectService.findById.mockResolvedValue(project);
      mockProjectService.findRecent.mockResolvedValue(projectsList);

      const result = (await projectDetailLoader(createLoaderArgs(project.$id))) as ProjectDetailLoaderData;

      expect(mockProjectService.findById).toHaveBeenCalledWith(project.$id);
      expect(mockProjectService.findRecent).toHaveBeenCalledOnce();
      expect(result).toEqual({ project, projects: projectsList });
    });

    it('handles different project IDs correctly', async () => {
      const customProject = createMockProject({ $id: 'other-id', name: 'Custom' });
      const projectsList = createMockProjects([customProject]);

      mockProjectService.findById.mockResolvedValue(customProject);
      mockProjectService.findRecent.mockResolvedValue(projectsList);

      const result = (await projectDetailLoader(createLoaderArgs('other-id'))) as ProjectDetailWithRecentLoaderData;

      expect(result.project.$id).toBe('other-id');
      expect(result.project.name).toBe('Custom');
      expect(result.projects.documents[0].$id).toBe('other-id');
    });

    it('returns valid ProjectDetailLoaderData shape', async () => {
      const project = createMockProject();
      const projects = createMockProjects([project]);

      mockProjectService.findById.mockResolvedValue(project);
      mockProjectService.findRecent.mockResolvedValue(projects);

      const result = (await projectDetailLoader(createLoaderArgs(project.$id))) as ProjectDetailWithRecentLoaderData;

      expect(result).toHaveProperty('project');
      expect(result).toHaveProperty('projects');
      expect(Array.isArray(result.projects.documents)).toBe(true);
      expect(result.project).toEqual(project);
    });
  });

  describe('error handling', () => {
    it('throws if projectId is missing', async () => {
      mockProjectService.findById.mockRejectedValue(new Error('Project ID is required'));

      await expect(projectDetailLoader(createLoaderArgs(undefined))).rejects.toThrow('Project ID is required');
    });

    it('throws if findById fails', async () => {
      mockProjectService.findById.mockRejectedValue(new Error('Failed to fetch project'));
      mockProjectService.findRecent.mockResolvedValue(createMockProjects());

      await expect(projectDetailLoader(createLoaderArgs('invalid'))).rejects.toThrow('Failed to fetch project');
    });

    it('throws if findRecent fails', async () => {
      const project = createMockProject();
      mockProjectService.findById.mockResolvedValue(project);
      mockProjectService.findRecent.mockRejectedValue(new Error('Failed to fetch projects'));

      await expect(projectDetailLoader(createLoaderArgs(project.$id))).rejects.toThrow('Failed to fetch projects');
    });
  });
});
