import { Project, ProjectsListResponse } from '@/features/projects/types';
import { TaskCounts, TasksResponse } from '@/features/tasks/types';
import { HTTP_METHODS, HTTP_STATUS } from '@/shared/constants';
import { ToasterToast } from '@/shared/hooks/use-toast/use-toast';
import { Models } from 'appwrite';

export type CrudMode = 'create' | 'update';
export type EntityType = 'task' | 'project';
export type EmptyStateVariant = 'today' | 'inbox' | 'upcoming' | 'completed' | 'project';
export type SearchStatus = 'idle' | 'loading' | 'searching';
export type NavigationState = 'idle' | 'loading' | 'submitting';
export type OperationResult = 'success' | 'error';
export type TriggerVariant = 'icon' | 'menu-item';
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export interface Base extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface PaginatedResponse<T> {
  total: number;
  documents: T[];
}

export interface UseLoadMoreParams {
  initialCount?: number;
  pageSize?: number;
}

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
  project: Project;
}

export interface ProjectsLoaderData {
  projects: ProjectsListResponse;
}

export interface ProjectDetailWithRecentLoaderData {
  project: Project;
  projects: ProjectsListResponse;
}

interface Img {
  src: string;
  width: number;
  height: number;
}

export interface EmptyStateContent {
  img: Img;
  title: string;
  description: string;
}

export interface ToastMessages {
  loading: string;
  success: string;
  error: string;
  errorDescription: string;
}

export interface ToastHandler {
  id: string;
  dismiss: () => void;
  update: (options: ToasterToast & { id: string }) => void;
}
