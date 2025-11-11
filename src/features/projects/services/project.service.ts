import { projectRepository } from '@/features/projects/repositories/project.repository';
import { ProjectEntity, ProjectFormInput, ProjectsListResponse } from '@/features/projects/types';
import { DEFAULT_FETCH_LIMIT } from '@/shared/constants/validation';
import { getUserId } from '@/shared/utils/auth/auth.utils';
import { generateID } from '@/shared/utils/text/text.utils';

export const projectService = {
  async findById(projectId: string): Promise<ProjectEntity> {
    try {
      const doc = await projectRepository.findById(projectId);

      return doc;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Failed to load project');
    }
  },
  async findAll(searchQuery: string): Promise<ProjectsListResponse> {
    try {
      const userId = getUserId();

      const docs = await projectRepository.findByUserId(userId, { search: searchQuery });

      return docs;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to load projects');
    }
  },
  async findRecent(limit: number = DEFAULT_FETCH_LIMIT): Promise<ProjectsListResponse> {
    try {
      const userId = getUserId();

      const docs = await projectRepository.findByUserId(userId, { limit });

      return docs;
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      throw new Error('Failed to load recent projects');
    }
  },

  async create(data: ProjectFormInput): Promise<ProjectEntity> {
    try {
      const payload = {
        name: data.name,
        color_name: data.color_name,
        color_hex: data.color_hex,
        userId: getUserId(),
      };

      const doc = await projectRepository.create(generateID(), payload);

      return doc;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  },
  async update(projectId: string, data: Omit<ProjectFormInput, 'id'>): Promise<ProjectEntity> {
    try {
      const payload = {
        name: data.name,
        color_name: data.color_name,
        color_hex: data.color_hex,
      };

      const doc = await projectRepository.update(projectId, payload);

      return doc;
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  },
  async delete(projectId: string): Promise<void> {
    try {
      await projectRepository.delete(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  },
};
