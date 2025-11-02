import { projectService } from '@/services/project/project.service';
import { taskService } from '@/services/task/task.service';
import type { LoaderFunction } from 'react-router';

export const sidebarLoader: LoaderFunction = async () => {
  const [projects, taskCounts] = await Promise.all([projectService.getRecentProjects(), taskService.getTaskCounts()]);

  return { projects, taskCounts };
};
