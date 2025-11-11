import { ProjectEntity, ProjectsListResponse } from '@/features/projects/types';
import { TaskCounts, TasksResponse } from '@/features/tasks/types';

export interface SidebarLoaderData {
  projects: ProjectsListResponse;
  taskCounts: TaskCounts;
}

export interface ProjectsWithTasksLoaderData {
  projects: ProjectsListResponse;
  tasks: TasksResponse;
}

export interface TasksLoaderData {
  tasks: TasksResponse;
}

export interface ProjectDetailLoaderData {
  project: ProjectEntity;
}

export interface ProjectsLoaderData {
  projects: ProjectsListResponse;
}

export interface ProjectDetailWithRecentLoaderData {
  project: ProjectEntity;
  projects: ProjectsListResponse;
}
