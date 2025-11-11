import { DEFAULT_EMPTY_STATE_IMAGE_HEIGHT } from '@/shared/constants/defaults';
import { EmptyStateContent, EmptyStateVariant } from '@/shared/types';

const createEmptyState = (src: string, width: number, title: string, description: string): EmptyStateContent => ({
  img: {
    src,
    width,
    height: DEFAULT_EMPTY_STATE_IMAGE_HEIGHT,
  },
  title,
  description,
});

export const EMPTY_STATE_CONTENTS: Record<EmptyStateVariant, EmptyStateContent> = {
  today: createEmptyState(
    '/empty-state/today-task-empty-state.png',
    226,
    'What do you need to get done today?',
    'By default, tasks added here will be due today. Click + to add a task.'
  ),
  inbox: createEmptyState(
    '/empty-state/inbox-task-empty-state.png',
    344,
    'What is on your mind?',
    "Capture tasks that don't have a specific category. Click + to add a task."
  ),
  upcoming: createEmptyState(
    '/empty-state/upcoming-task-empty-state.png',
    208,
    'Plan ahead with ease!',
    'Tasks added here will be due in the future. Click + to schedule a task.'
  ),
  completed: createEmptyState(
    '/empty-state/completed-task-empty-state.png',
    231,
    'You have been productive!',
    'All the tasks you have completed will appear here. Keep up the great work!'
  ),
  project: createEmptyState(
    '/empty-state/project-task-empty-state.png',
    228,
    "Let's build something amazing!",
    'Add tasks specific to this project. Click + to start planning.'
  ),
};

export const PROJECT_TOAST_CONTENTS = {
  CREATE: {
    loading: 'Creating project...',
    success: 'Project created!',
    error: 'Error creating project!',
    errorDescription: 'An error occurred while creating the project!',
  },
  UPDATE: {
    loading: 'Updating project...',
    success: 'Project updated!',
    error: 'Error updating project!',
    errorDescription: 'An error occurred while updating the project!',
  },
  DELETE: {
    loading: 'Deleting project...',
    success: 'Project deleted!',
    error: 'Error deleting project!',
    errorDescription: 'An error occurred while deleting the project!',
  },
} as const;

export const TASK_TOAST_CONTENTS = {
  CREATE: {
    loading: 'Creating task...',
    success: 'Task created!',
    successDescription: 'The task has been successfully created!',
    error: 'Error creating task!',
    errorDescription: 'An error occurred while creating the task!',
  },
  UPDATE: {
    loading: 'Updating task...',
    success: 'Task updated!',
    successDescription: 'The task has been successfully updated!',
    error: 'Error updating task!',
    errorDescription: 'An error occurred while updating the task!',
  },
  COMPLETE: {
    success: 'Task completed!',
    UNCOMPLETE: 'Task marked as incomplete!',
    error: 'Error updating task status!',
    errorDescription: 'An error occurred while updating the task status!',
  },
  DELETE: {
    loading: 'Deleting task...',
    success: 'Task deleted!',
    successDescription: 'The task has been successfully deleted!',
    error: 'Error deleting task!',
    errorDescription: 'An error occurred while deleting the task!',
  },
} as const;
