import { Task } from '@/features/tasks/types';
import { Base, PaginatedResponse } from '@/shared/types';

export interface Project extends Base {
  userId: string;
  name: string;
  color_name: string;
  color_hex: string;
  tasks: Task[] | null;
}
export interface ProjectListItem extends Base {
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
