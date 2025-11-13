import { TaskEntity } from '@/features/tasks/types';
import { BaseEntity, CrudMode, PaginatedResponse } from '@/shared/types';
import { ChangeEvent } from 'react';

export interface ProjectEntity extends BaseEntity {
  userId: string;
  name: string;
  color_name: string;
  color_hex: string;
  tasks: TaskEntity[] | null;
}
export interface ProjectListItem extends BaseEntity {
  name: string;
  color_name: string;
  color_hex: string;
}
export interface ProjectInput {
  id?: string | null;
  name: string;
  color_name: string;
  color_hex: string;
}
export interface ProjectFormInput extends ProjectInput {
  ai_task_gen: boolean;
  task_gen_prompt: string;
}
export interface ProjectCreateInput extends ProjectInput {
  userId: string;
}
export interface SelectedProject {
  id: string | null;
  name: string;
  colorHex: string;
}
export interface ColorValue {
  name: string;
  hex: string;
}
export type ProjectUpdateInput = ProjectInput;
export type ProjectsListResponse = PaginatedResponse<ProjectListItem>;

export interface UseProjectModalOptions {
  mode?: CrudMode;
  onSuccess?: () => void;
}
export interface UseProjectModalResult {
  handleSave: (data: ProjectFormInput) => Promise<void>;
  handleDelete: (id: string, name: string) => Promise<void>;
  isLoading: boolean;
}

export interface UseProjectMutationOptions {
  onSuccess?: () => void;
}

export interface UseProjectMutationResult {
  createProject: (data: ProjectFormInput) => Promise<void>;
  updateProject: (data: ProjectFormInput) => Promise<void>;
  deleteProject: (id: string, name: string) => Promise<void>;
  isLoading: boolean;
}

export interface useProjectSearchResult {
  handleSearch: (searchValue: string) => void;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isSearching: boolean;
  isIdle: boolean;
}

export interface UseProjectFilterParams {
  tasks: TaskEntity[];
}
export interface UseProjectFormParams {
  defaultValues: ProjectInput;
  onSubmit: (formData: ProjectFormInput) => Promise<void>;
}
export interface UseProjectFilterResult {
  filteredTasks: TaskEntity[] | undefined;
  filteredCount: number;
  filterValue: string | null;
  setFilterValue: (value: string | null) => void;
}

export interface UseProjectFormResult {
  name: string;
  color: ColorValue;
  aiEnabled: boolean;
  aiPrompt: string;
  colorPickerOpen: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  formValues: ProjectFormInput;
  setName: (name: string) => void;
  setColor: (value: ColorValue) => void;
  setAiEnabled: (enabled: boolean) => void;
  setAiPrompt: (prompt: string) => void;
  setColorPickerOpen: (open: boolean) => void;
  handleColorSelect: (value: string) => void;
  handleSubmit: () => Promise<void>;
}
