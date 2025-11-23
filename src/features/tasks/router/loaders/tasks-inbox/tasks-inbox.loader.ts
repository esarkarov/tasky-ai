import { projectService } from '@/features/projects/services/project.service';
import { taskService } from '@/features/tasks/services/task.service';

export const tasksInboxLoader = async () => {
  const [projects, tasks] = await Promise.all([projectService.findRecent(), taskService.findInboxTasks()]);

  return { tasks, projects };
};
