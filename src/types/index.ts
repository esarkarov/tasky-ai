export interface ITaskForm {
  id?: string;
  content: string;
  due_date: Date | null;
  completed?: boolean;
  project: string | null;
}
