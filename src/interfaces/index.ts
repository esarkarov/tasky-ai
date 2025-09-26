import type { Models } from 'appwrite';

export interface ITaskForm {
  id?: string;
  content: string;
  due_date: Date | null;
  completed?: boolean;
  projectId: string | null;
}

export interface IProject {
  id: string | null;
  name: string;
  color_name: string;
  color_hex: string;
}

export interface ITask {
  id?: string;
  content: string;
  due_date: Date | null;
  completed?: boolean;
  project: IProject | null;
  userId: string;
}

export interface IEmptyStateContent {
  img?: {
    src: string;
    width: number;
    height: number;
  };
  title: string;
  description: string;
}

interface ITaskCounts {
  inboxTasks: number;
  todayTasks: number;
}

export interface IAppLoaderData {
  projects: Models.DocumentList<Models.Document>;
  taskCounts: ITaskCounts;
}
