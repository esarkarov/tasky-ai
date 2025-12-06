import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService, DEFAULT_FETCH_LIMIT } from '@/features/projects/services/project.service';
import { projectRepository } from '@/features/projects/repositories/project.repository';
import { getUserId } from '@/shared/utils/auth/auth.utils';
import { generateID } from '@/shared/utils/text/text.utils';
import { createMockProject, createMockProjects } from '@/core/test-setup/factories';
import type { ProjectFormInput } from '@/features/projects/types';

vi.mock('@/features/projects/repositories/project.repository', () => ({
  projectRepository: {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/shared/utils/auth/auth.utils', () => ({
  getUserId: vi.fn(),
}));

vi.mock('@/shared/utils/text/text.utils', () => ({
  generateID: vi.fn(),
}));

const mockRepository = vi.mocked(projectRepository);
const mockGetUserId = vi.mocked(getUserId);
const mockGenerateID = vi.mocked(generateID);

describe('projectService', () => {
  const MOCK_USER_ID = 'user-123';
  const MOCK_PROJECT_ID = 'project-456';
  const MOCK_GENERATED_ID = 'generated-789';

  const createMockFormData = (overrides?: Partial<ProjectFormInput>): ProjectFormInput => ({
    name: 'Test Project',
    color_name: 'blue',
    color_hex: '#0000FF',
    ai_task_gen: false,
    task_gen_prompt: '',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserId.mockReturnValue(MOCK_USER_ID);
    mockGenerateID.mockReturnValue(MOCK_GENERATED_ID);
  });

  describe('findById', () => {
    it('should return project when found', async () => {
      const mockProject = createMockProject();
      mockRepository.findById.mockResolvedValue(mockProject);

      const result = await projectService.findById(MOCK_PROJECT_ID);

      expect(mockRepository.findById).toHaveBeenCalledWith(MOCK_PROJECT_ID);
      expect(mockRepository.findById).toHaveBeenCalledOnce();
      expect(result).toEqual(mockProject);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Search id unavailable'));

      await expect(projectService.findById(MOCK_PROJECT_ID)).rejects.toThrow('Failed to load project');
      expect(mockRepository.findById).toHaveBeenCalledOnce();
    });
  });

  describe('search', () => {
    it('should return projects matching search query', async () => {
      const searchQuery = 'website';
      const mockProjects = createMockProjects();
      mockRepository.findByUserId.mockResolvedValue(mockProjects);

      const result = await projectService.search(searchQuery);

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { search: searchQuery });
      expect(mockRepository.findByUserId).toHaveBeenCalledOnce();
      expect(result).toEqual(mockProjects);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findByUserId.mockRejectedValue(new Error('Search id unavailable'));

      await expect(projectService.search('test')).rejects.toThrow('Failed to load projects');
      expect(mockRepository.findByUserId).toHaveBeenCalledOnce();
    });
  });

  describe('findRecent', () => {
    it('should return recent projects with default limit', async () => {
      const mockProjects = createMockProjects();
      mockRepository.findByUserId.mockResolvedValue(mockProjects);

      const result = await projectService.findRecent();

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { limit: DEFAULT_FETCH_LIMIT });
      expect(mockRepository.findByUserId).toHaveBeenCalledOnce();
      expect(result).toEqual(mockProjects);
    });

    it('should return recent projects with custom limit', async () => {
      const customLimit = 10;
      const mockProjects = createMockProjects();
      mockRepository.findByUserId.mockResolvedValue(mockProjects);

      const result = await projectService.findRecent(customLimit);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { limit: customLimit });
      expect(result).toEqual(mockProjects);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findByUserId.mockRejectedValue(new Error('Search id unavailable'));

      await expect(projectService.findRecent()).rejects.toThrow('Failed to load recent projects');
      expect(mockRepository.findByUserId).toHaveBeenCalledOnce();
    });
  });

  describe('create', () => {
    it('should create project with form data', async () => {
      const formData = createMockFormData();
      const mockProject = createMockProject(formData);
      mockRepository.create.mockResolvedValue(mockProject);

      const result = await projectService.create(formData);

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockGenerateID).toHaveBeenCalledOnce();
      expect(mockRepository.create).toHaveBeenCalledWith(MOCK_GENERATED_ID, {
        name: formData.name,
        color_name: formData.color_name,
        color_hex: formData.color_hex,
        userId: MOCK_USER_ID,
      });
      expect(mockRepository.create).toHaveBeenCalledOnce();
      expect(result).toEqual(mockProject);
    });

    it('should throw error when repository fails', async () => {
      const formData = createMockFormData();
      mockRepository.create.mockRejectedValue(new Error('Failed to create project'));

      await expect(projectService.create(formData)).rejects.toThrow('Failed to create project');
      expect(mockRepository.create).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update project with form data', async () => {
      const formData = createMockFormData({
        name: 'Updated Project',
        color_name: 'green',
        color_hex: '#00FF00',
      });
      const updatedProject = createMockProject(formData);
      mockRepository.update.mockResolvedValue(updatedProject);

      const result = await projectService.update(MOCK_PROJECT_ID, formData);

      expect(mockRepository.update).toHaveBeenCalledWith(MOCK_PROJECT_ID, {
        name: formData.name,
        color_name: formData.color_name,
        color_hex: formData.color_hex,
      });
      expect(mockRepository.update).toHaveBeenCalledOnce();
      expect(result).toEqual(updatedProject);
    });

    it('should throw error when repository fails', async () => {
      const formData = createMockFormData();
      mockRepository.update.mockRejectedValue(new Error('Failed to update project'));

      await expect(projectService.update(MOCK_PROJECT_ID, formData)).rejects.toThrow('Failed to update project');
      expect(mockRepository.update).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should delete project successfully', async () => {
      mockRepository.delete.mockResolvedValue({});

      await projectService.delete(MOCK_PROJECT_ID);

      expect(mockRepository.delete).toHaveBeenCalledWith(MOCK_PROJECT_ID);
      expect(mockRepository.delete).toHaveBeenCalledOnce();
    });

    it('should throw error when repository fails', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Failed to delete project'));

      await expect(projectService.delete(MOCK_PROJECT_ID)).rejects.toThrow('Failed to delete project');
      expect(mockRepository.delete).toHaveBeenCalledOnce();
    });
  });
});
