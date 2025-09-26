export interface ITaskForm {
  id?: string;
  content: string;
  due_date: Date | null;
  completed?: boolean;
  project: string | null;
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
