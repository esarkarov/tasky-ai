import { Project, ProjectsListResponse } from '@/features/projects/types';
import { Task, TaskCounts, TasksResponse } from '@/features/tasks/types';
import { HttpMethod, ProjectsWithTasksLoaderData, TasksLoaderData } from '@/shared/types';
import { GenerateContentResponse } from '@google/genai';

export const createMockTask = (overrides?: Partial<Task>): Task => ({
  $id: 'task-1',
  id: 'task-1',
  content: 'Test task content',
  completed: false,
  due_date: null,
  projectId: null,
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $collectionId: 'tasks',
  $databaseId: 'tasks-db',
  $permissions: [],
  ...overrides,
});

export const createMockTasks = (documents: Task[] = [createMockTask()]): TasksResponse => ({
  total: documents.length,
  documents,
});

export const createMockTaskCounts = (today = 3, inbox = 1): TaskCounts => ({
  todayTasks: today,
  inboxTasks: inbox,
});

export const createMockProject = (overrides?: Partial<Project>): Project => ({
  $id: 'project-1',
  userId: 'user-1',
  name: 'Test Project name',
  color_name: 'blue',
  color_hex: '#0000FF',
  tasks: [],
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $collectionId: 'projects',
  $databaseId: 'projects-db',
  $permissions: [],
  ...overrides,
});

export const createMockProjects = (documents: Project[] = [createMockProject()]): ProjectsListResponse => ({
  total: documents.length,
  documents,
});

export const createMockLoaderArgs = (url: string = 'http://localhost', projectId?: string) => ({
  request: new Request(url),
  params: { projectId },
  context: {},
  unstable_pattern: '',
});

export const createMockRequest = (method: HttpMethod) => new Request('http://localhost', { method });

export const createMockActionArgs = (request: Request) => ({
  request,
  params: {},
  context: {},
  unstable_pattern: '',
});

export const createMockAIContentResponse = (
  text: string = '{"result": "test response"}',
  overrides?: Partial<GenerateContentResponse>
): GenerateContentResponse => ({
  text,
  data: '',
  functionCalls: [],
  executableCode: '',
  codeExecutionResult: '',
  ...overrides,
});

export const createMockProjectsWithTasksLoaderData = (
  tasks: Task[] = [createMockTask()],
  projects: Project[] = [createMockProject()]
): ProjectsWithTasksLoaderData => ({
  tasks: {
    documents: tasks,
    total: tasks.length,
  },
  projects: {
    documents: projects,
    total: projects.length,
  },
});

export const createMockTasksLoaderData = (tasks: Task[] = [createMockTask()]): TasksLoaderData => ({
  tasks: {
    documents: tasks,
    total: tasks.length,
  },
});
