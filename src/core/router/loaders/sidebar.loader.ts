import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';
import type { LoaderFunction } from 'react-router';

export const sidebarLoader: LoaderFunction = async () => {
  const [projects, taskCounts] = await Promise.all([projectService.findRecent(), taskService.countTasks()]);

  return { projects, taskCounts };
};
