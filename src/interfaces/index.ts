import type { Models } from 'appwrite';

export interface IProject {
  id: string | null;
  name: string;
  color_name: string;
  color_hex: string;
}
export interface IProjectInfo {
  name: string;
  colorHex: string;
}

export interface ITaskForm {
  id?: string;
  content: string;
  due_date: Date | null;
  completed?: boolean;
  projectId: string | null;
}

export interface ITask {
  id?: string;
  content: string;
  due_date: Date | null;
  completed?: boolean;
  project: IProject | null;
  userId: string;
}

export interface ITaskCounts {
  inboxTasks: number;
  todayTasks: number;
}

export interface IImg {
  src: string;
  width: number;
  height: number;
}

export interface IEmptyStateContent {
  img?: IImg;
  title: string;
  description: string;
}

export interface IAppLoaderData {
  projects: Models.DocumentList<Models.Document>;
  taskCounts: ITaskCounts;
}
