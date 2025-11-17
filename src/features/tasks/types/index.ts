import { Project } from '@/features/projects/types';
import { Base, PaginatedResponse } from '@/shared/types';

export interface Task extends Base {
  id: string;
  content: string;
  due_date: Date | null;
  completed: boolean;
  projectId: Project | null;
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
export type TasksResponse = PaginatedResponse<Task>;
