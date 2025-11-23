import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';

export const tasksCompletedLoader = async () => {
  const [projects, tasks] = await Promise.all([projectService.findRecent(), taskService.findCompletedTasks()]);

  return { tasks, projects };
};
