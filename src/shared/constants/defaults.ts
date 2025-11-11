import { ProjectInput } from '@/features/projects/types';
import { TaskFormInput } from '@/features/tasks/types';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
export const DEFAULT_EMPTY_STATE_IMAGE_HEIGHT = 260;

export const DEFAULT_TASK_FORM_DATA: TaskFormInput = {
  content: '',
  due_date: null,
  projectId: null,
} as const;

export const DEFAULT_PROJECT_FORM_DATA: ProjectInput = {
  id: null,
  name: '',
  color_name: 'Slate',
  color_hex: '#64748b',
} as const;
