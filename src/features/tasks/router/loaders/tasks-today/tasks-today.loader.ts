import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';
import type { LoaderFunction } from 'react-router';

export const tasksTodayLoader: LoaderFunction = async () => {
  const [projects, tasks] = await Promise.all([projectService.findRecent(), taskService.findTodayTasks()]);

  return { tasks, projects };
};
