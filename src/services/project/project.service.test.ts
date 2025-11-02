import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from './project.service';
import { projectRepository } from '@/repositories/project/project.repository';
import { getUserId } from '@/utils/auth/auth.utils';
import { generateID } from '@/utils/text/text.utils';
import { ProjectEntity, ProjectsListResponse, ProjectFormInput, ProjectListItem } from '@/types/projects.types';
import { DEFAULT_FETCH_LIMIT } from '@/constants/validation';

vi.mock('@/repositories/project/project.repository', () => ({
  projectRepository: {
    findById: vi.fn(),
    listByUserId: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/utils/auth/auth.utils', () => ({
  getUserId: vi.fn(),
}));
vi.mock('@/utils/text/text.utils', () => ({
  generateID: vi.fn(),
}));
vi.mock('@/constants/validation', () => ({
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

  describe('getProjectById', () => {
    it('should return project when found', async () => {
      const mockProject = createMockProject();
      mockedProjectRepository.findById.mockResolvedValue(mockProject);

      const result = await projectService.getProjectById(MOCK_PROJECT_ID);

      expect(mockedProjectRepository.findById).toHaveBeenCalledWith(MOCK_PROJECT_ID);
      expect(result).toEqual(mockProject);
    });

    it('should throw error when repository fails', async () => {
      mockedProjectRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(projectService.getProjectById(MOCK_PROJECT_ID)).rejects.toThrow('Failed to load project');
      expect(mockedProjectRepository.findById).toHaveBeenCalledWith(MOCK_PROJECT_ID);
    });
  });

  describe('getUserProjects', () => {
    it('should return user projects with search query', async () => {
      const searchQuery = 'test';
      const mockResponse = createMockProjectsResponse();
      mockedProjectRepository.listByUserId.mockResolvedValue(mockResponse);

      const result = await projectService.getUserProjects(searchQuery);

      expect(mockedGetUserId).toHaveBeenCalled();
      expect(mockedProjectRepository.listByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { search: searchQuery });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when repository fails', async () => {
      const searchQuery = 'test';
      mockedProjectRepository.listByUserId.mockRejectedValue(new Error('Database error'));

      await expect(projectService.getUserProjects(searchQuery)).rejects.toThrow('Failed to load projects');
    });
  });

  describe('getRecentProjects', () => {
    it('should return recent projects with default limit', async () => {
      const mockResponse = createMockProjectsResponse();
      mockedProjectRepository.listByUserId.mockResolvedValue(mockResponse);

      const result = await projectService.getRecentProjects();

      expect(mockedGetUserId).toHaveBeenCalled();
      expect(mockedProjectRepository.listByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { limit: DEFAULT_FETCH_LIMIT });
      expect(result).toEqual(mockResponse);
    });

    it('should return recent projects with custom limit', async () => {
      const customLimit = 5;
      const mockResponse = createMockProjectsResponse();
      mockedProjectRepository.listByUserId.mockResolvedValue(mockResponse);

      const result = await projectService.getRecentProjects(customLimit);

      expect(mockedProjectRepository.listByUserId).toHaveBeenCalledWith(MOCK_USER_ID, { limit: customLimit });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when repository fails', async () => {
      mockedProjectRepository.listByUserId.mockRejectedValue(new Error('Database error'));

      await expect(projectService.getRecentProjects()).rejects.toThrow('Failed to load recent projects');
    });
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      const formData = createMockFormData();
      const mockProject = createMockProject();
      mockedGenerateID.mockReturnValue(MOCK_GENERATED_ID);
      mockedProjectRepository.create.mockResolvedValue(mockProject);

      const result = await projectService.createProject(formData);

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

      await expect(projectService.createProject(formData)).rejects.toThrow('Failed to create project');
    });
  });

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const updateData = createMockFormData({ name: 'Updated Project', color_name: 'green', color_hex: '#00FF00' });
      const updatedProject = createMockProject(updateData);
      mockedProjectRepository.update.mockResolvedValue(updatedProject);

      const result = await projectService.updateProject(MOCK_PROJECT_ID, updateData);

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

      await expect(projectService.updateProject(MOCK_PROJECT_ID, updateData)).rejects.toThrow(
        'Failed to update project'
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      mockedProjectRepository.delete.mockResolvedValue({});

      await projectService.deleteProject(MOCK_PROJECT_ID);

      expect(mockedProjectRepository.delete).toHaveBeenCalledWith(MOCK_PROJECT_ID);
    });

    it('should throw error when repository fails', async () => {
      mockedProjectRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(projectService.deleteProject(MOCK_PROJECT_ID)).rejects.toThrow('Failed to delete project');
    });
  });
});
