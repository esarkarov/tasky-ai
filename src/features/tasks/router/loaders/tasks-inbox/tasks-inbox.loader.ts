import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';
import type { LoaderFunction } from 'react-router';

export const tasksInboxLoader: LoaderFunction = async () => {
  const [projects, tasks] = await Promise.all([projectService.findRecent(), taskService.findInboxTasks()]);

  return { tasks, projects };
};
