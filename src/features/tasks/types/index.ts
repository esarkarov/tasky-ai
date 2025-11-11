import { ProjectEntity, ProjectListItem, SelectedProject } from '@/features/projects/types';
import { BaseEntity, PaginatedResponse } from '@/shared/types';
import { useFetcher } from 'react-router';

export interface TaskEntity extends BaseEntity {
  id: string;
  content: string;
  due_date: Date | null;
  completed: boolean;
  projectId: ProjectEntity | null;
}
export interface TaskCounts {
  inboxTasks: number;
  todayTasks: number;
}
export interface TaskInput {
  content: string;
  due_date: Date | null;
  completed: boolean;
  projectId: string | null;
}
export interface TaskFormInput extends Omit<TaskInput, 'completed'> {
  id?: string;
  completed?: boolean;
}
export interface TaskCreateInput extends TaskInput {
  userId: string;
}
export interface TaskUpdateInput extends Omit<TaskInput, 'completed'> {
  completed?: boolean;
}
export type TasksResponse = PaginatedResponse<TaskEntity>;

export interface UseTaskOperationsParams {
  onSuccess?: () => void;
  enableUndo?: boolean;
}
export interface UseTaskOperationsResult {
  handleCreateTask: (formData: TaskFormInput) => Promise<void>;
  handleUpdateTask: (formData: TaskFormInput, taskId?: string) => Promise<void>;
  toggleTaskComplete: (taskId: string, completed: boolean) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  fetcher: ReturnType<typeof useFetcher>;
  formState: boolean;
}

export interface UseTaskFormParams {
  defaultValues: TaskFormInput;
  projects?: ProjectListItem[];
  onSubmit?: (formData: TaskFormInput, taskId?: string) => Promise<void>;
  handleCancel: () => void;
}
export interface UseTaskFormResult {
  content: string;
  dueDate: Date | null;
  selectedProject: SelectedProject;
  isSubmitting: boolean;
  isValid: boolean;
  formValues: TaskFormInput;
  setContent: (content: string) => void;
  setDueDate: (date: Date | null) => void;
  handleProjectChange: (project: SelectedProject) => void;
  removeDueDate: () => void;
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
}
