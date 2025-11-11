import { projectRepository } from '@/features/projects/repositories/project.repository';
import { projectService } from '@/features/projects/services/project.service';
import { ProjectEntity, ProjectFormInput, ProjectListItem, ProjectsListResponse } from '@/features/projects/types';
import { DEFAULT_FETCH_LIMIT } from '@/shared/constants/validation';
import { getUserId } from '@/shared/utils/auth/auth.utils';
import { generateID } from '@/shared/utils/text/text.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/projects/repositories/project.repository', () => ({
  projectRepository: {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/shared/utils/auth/auth.utils', () => ({
  getUserId: vi.fn(),
}));
vi.mock('@/shared/utils/text/text.utils', () => ({
  generateID: vi.fn(),
}));
vi.mock('@/shared/constants/validation', () => ({
  DEFAULT_FETCH_LIMIT: 100,
}));

const mockedProjectRepository = vi.mocked(projectRepository);
const mockedGetUserId = vi.mocked(getUserId);
const mockedGenerateID = vi.mocked(generateID);

describe('projectService', () => {
  const MOCK_USER_ID = 'user-123';
  const MOCK_PROJECT_ID = 'project-123';
  const MOCK_GENERATED_ID = 'generated-id-123';

  const createMockProject = (overrides?: Partial<ProjectEntity>): ProjectEntity => ({
    $id: MOCK_PROJECT_ID,
    userId: MOCK_USER_ID,
    name: 'Test Project',
    color_name: 'blue',
    color_hex: '#0000FF',
    tasks: [],
    $createdAt: '',
    $updatedAt: '',
    $permissions: [],
    $databaseId: '',
    $collectionId: '',
    ...overrides,
  });

  const createMockProjectListItem = (overrides?: Partial<ProjectListItem>): ProjectListItem => ({
    $id: MOCK_PROJECT_ID,
    name: 'Test Project',
    color_name: 'blue',
    color_hex: '#0000FF',
    $createdAt: '2023-01-01',
    $updatedAt: '',
    $permissions: [],
    $databaseId: '',
    $collectionId: '',
    ...overrides,
  });

  const createMockProjectsResponse = (
    items: ProjectListItem[] = [createMockProjectListItem()]
  ): ProjectsListResponse => ({
    documents: items,
    total: items.length,
  });

  const createMockFormData = (overrides?: Partial<ProjectFormInput>): ProjectFormInput => ({
    name: 'New Project',
    color_name: 'red',
    color_hex: '#FF0000',
    ai_task_gen: false,
    task_gen_prompt: '',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetUserId.mockReturnValue(MOCK_USER_ID);
  });

  describe('findById', () => {
    it('should return project when found', async () => {
      const mockProject = createMockProject();
      mockedProjectRepository.findById.mockResolvedValue(mockProject);

      const result = await projectService.findById(MOCK_PROJECT_ID);

      expect(mockedProjectRepository.findById).toHaveBeenCalledWith(MOCK_PROJECT_ID);
      expect(result).toEqual(mockProject);
    });

    it('should throw error when repository fails', async () => {
      mockedProjectRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(projectService.findById(MOCK_PROJECT_ID)).rejects.toThrow('Failed to load project');
      expect(mockedProjectRepository.findById).toHaveBeenCalledWith(MOCK_PROJECT_ID);
    });
  });

  describe('findAll', () => {
    it('should return user projects with search query', async () => {
      const searchQuery = 'test';
      const mockResponse = createMockProjectsResponse();
      mockedProjectRepository.findByUserId.mockResolvedValue(mockResponse);

      const result = await projectService.findAll(searchQuery);

      expect(mockedGetUserId).toHaveBeenCalled();
      expect(mockedProjectRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { search: searchQuery });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when repository fails', async () => {
      const searchQuery = 'test';
      mockedProjectRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(projectService.findAll(searchQuery)).rejects.toThrow('Failed to load projects');
    });
  });

  describe('findRecent', () => {
    it('should return recent projects with default limit', async () => {
      const mockResponse = createMockProjectsResponse();
      mockedProjectRepository.findByUserId.mockResolvedValue(mockResponse);

      const result = await projectService.findRecent();

      expect(mockedGetUserId).toHaveBeenCalled();
      expect(mockedProjectRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { limit: DEFAULT_FETCH_LIMIT });
      expect(result).toEqual(mockResponse);
    });

    it('should return recent projects with custom limit', async () => {
      const customLimit = 5;
      const mockResponse = createMockProjectsResponse();
      mockedProjectRepository.findByUserId.mockResolvedValue(mockResponse);

      const result = await projectService.findRecent(customLimit);

      expect(mockedProjectRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { limit: customLimit });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when repository fails', async () => {
      mockedProjectRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(projectService.findRecent()).rejects.toThrow('Failed to load recent projects');
    });
  });

  describe('create', () => {
    it('should create project successfully', async () => {
      const formData = createMockFormData();
      const mockProject = createMockProject();
      mockedGenerateID.mockReturnValue(MOCK_GENERATED_ID);
      mockedProjectRepository.create.mockResolvedValue(mockProject);

      const result = await projectService.create(formData);

      expect(mockedGetUserId).toHaveBeenCalled();
      expect(mockedGenerateID).toHaveBeenCalled();
      expect(mockedProjectRepository.create).toHaveBeenCalledWith(MOCK_GENERATED_ID, {
        name: formData.name,
        color_name: formData.color_name,
        color_hex: formData.color_hex,
        userId: MOCK_USER_ID,
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw error when repository fails', async () => {
      const formData = createMockFormData();
      mockedGenerateID.mockReturnValue(MOCK_GENERATED_ID);
      mockedProjectRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(projectService.create(formData)).rejects.toThrow('Failed to create project');
    });
  });

  describe('update', () => {
    it('should update project successfully', async () => {
      const updateData = createMockFormData({ name: 'Updated Project', color_name: 'green', color_hex: '#00FF00' });
      const updatedProject = createMockProject(updateData);
      mockedProjectRepository.update.mockResolvedValue(updatedProject);

      const result = await projectService.update(MOCK_PROJECT_ID, updateData);

      expect(mockedProjectRepository.update).toHaveBeenCalledWith(MOCK_PROJECT_ID, {
        name: updateData.name,
        color_name: updateData.color_name,
        color_hex: updateData.color_hex,
      });
      expect(result).toEqual(updatedProject);
    });

    it('should throw error when repository fails', async () => {
      const updateData = createMockFormData();
      mockedProjectRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(projectService.update(MOCK_PROJECT_ID, updateData)).rejects.toThrow('Failed to update project');
    });
  });

  describe('delete', () => {
    it('should delete project successfully', async () => {
      mockedProjectRepository.delete.mockResolvedValue({});

      await projectService.delete(MOCK_PROJECT_ID);

      expect(mockedProjectRepository.delete).toHaveBeenCalledWith(MOCK_PROJECT_ID);
    });

    it('should throw error when repository fails', async () => {
      mockedProjectRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(projectService.delete(MOCK_PROJECT_ID)).rejects.toThrow('Failed to delete project');
    });
  });
});
