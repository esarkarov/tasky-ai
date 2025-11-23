import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';

export const tasksUpcomingLoader = async () => {
  const [projects, tasks] = await Promise.all([projectService.findRecent(), taskService.findUpcomingTasks()]);

  return { tasks, projects };
};
