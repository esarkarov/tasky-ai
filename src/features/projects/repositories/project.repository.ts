import { env } from '@/core/config/env.config';
import { databases } from '@/core/lib/appwrite';
import { projectQueries } from '@/features/projects/repositories/project.queries';
import {
  ProjectCreateInput,
  ProjectEntity,
  ProjectListItem,
  ProjectsListResponse,
  ProjectUpdateInput,
} from '@/features/projects/types';

export const projectRepository = {
  findById: (id: string): Promise<ProjectEntity> =>
    databases.getDocument<ProjectEntity>(env.appwriteDatabaseId, env.appwriteProjectsCollectionId, id),
  findByUserId: (userId: string, options?: { search?: string; limit?: number }): Promise<ProjectsListResponse> =>
    databases.listDocuments<ProjectListItem>(
      env.appwriteDatabaseId,
      env.appwriteProjectsCollectionId,
      projectQueries.forUserProjectsList(userId, options)
    ),

  create: (id: string, data: ProjectCreateInput): Promise<ProjectEntity> =>
    databases.createDocument<ProjectEntity>(env.appwriteDatabaseId, env.appwriteProjectsCollectionId, id, data),
  update: (id: string, data: ProjectUpdateInput): Promise<ProjectEntity> =>
    databases.updateDocument<ProjectEntity>(env.appwriteDatabaseId, env.appwriteProjectsCollectionId, id, data),
  delete: (id: string) => databases.deleteDocument(env.appwriteDatabaseId, env.appwriteProjectsCollectionId, id),
};
