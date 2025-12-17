import { env } from '@/core/config/env.config';
import { databases } from '@/core/lib/appwrite';
import { analyticsQueries } from '@/features/analytics/repositories/analytics.queries';
import { TimeRange } from '@/features/analytics/types';
import { Project } from '@/features/projects/types';
import { Task } from '@/features/tasks/types';

export const analyticsRepository = {
  async getTasks(userId: string, timeRange: TimeRange): Promise<Task[]> {
    try {
      const response = await databases.listDocuments<Task>(
        env.appwriteDatabaseId,
        env.appwriteTasksCollectionId,
        analyticsQueries.forTasksInTimeRange(userId, timeRange)
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  },
  async getProjects(userId: string): Promise<Project[]> {
    try {
      const response = await databases.listDocuments<Project>(
        env.appwriteDatabaseId,
        env.appwriteProjectsCollectionId,
        analyticsQueries.forUserProjects(userId)
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  },
  async getProjectsWithTasks(userId: string): Promise<Project[]> {
    try {
      const [projects, tasks] = await Promise.all([this.getProjects(userId), this.getTasks(userId, '1y')]);
      const tasksByProject = new Map<string, Task[]>();

      tasks.forEach((task) => {
        if (task.projectId?.$id) {
          const projectTasks = tasksByProject.get(task.projectId.$id) || [];
          projectTasks.push(task);
          tasksByProject.set(task.projectId.$id, projectTasks);
        }
      });

      return projects.map((project) => ({
        ...project,
        tasks: tasksByProject.get(project.$id) || [],
      }));
    } catch (error) {
      console.error('Error fetching projects with tasks:', error);
      throw new Error('Failed to fetch projects with tasks');
    }
  },

  async countTasks(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        env.appwriteDatabaseId,
        env.appwriteTasksCollectionId,
        analyticsQueries.forTotalTasksCount(userId)
      );

      return response.total;
    } catch (error) {
      console.error('Error counting tasks:', error);
      return 0;
    }
  },
  async countCompletedTasks(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        env.appwriteDatabaseId,
        env.appwriteTasksCollectionId,
        analyticsQueries.forCompletedTasksCount(userId)
      );

      return response.total;
    } catch (error) {
      console.error('Error counting completed tasks:', error);
      return 0;
    }
  },
  async countPendingTasks(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        env.appwriteDatabaseId,
        env.appwriteTasksCollectionId,
        analyticsQueries.forPendingTasksCount(userId)
      );

      return response.total;
    } catch (error) {
      console.error('Error counting pending tasks:', error);
      return 0;
    }
  },
  async countOverdueTasks(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        env.appwriteDatabaseId,
        env.appwriteTasksCollectionId,
        analyticsQueries.forOverdueTasksCount(userId)
      );

      return response.total;
    } catch (error) {
      console.error('Error counting overdue tasks:', error);
      return 0;
    }
  },
  async getAllCounts(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    try {
      const [total, completed, pending, overdue] = await Promise.all([
        this.countTasks(userId),
        this.countCompletedTasks(userId),
        this.countPendingTasks(userId),
        this.countOverdueTasks(userId),
      ]);

      return { total, completed, pending, overdue };
    } catch (error) {
      console.error('Error fetching all counts:', error);
      return { total: 0, completed: 0, pending: 0, overdue: 0 };
    }
  },
};
