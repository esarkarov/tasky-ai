import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';

export const tasksTodayLoader = async () => {
  const [projects, tasks] = await Promise.all([projectService.findRecent(), taskService.findTodayTasks()]);

  return { tasks, projects };
};
