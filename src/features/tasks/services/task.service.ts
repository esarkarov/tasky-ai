import { AIGeneratedTask } from '@/features/ai/types';
import { taskRepository } from '@/features/tasks/repositories/task.repository';
import { TaskCounts, Task, TaskFormInput, TasksResponse } from '@/features/tasks/types';
import { getUserId } from '@/shared/utils/auth/auth.utils';
import { generateID } from '@/shared/utils/text/text.utils';
import { startOfToday, startOfTomorrow } from 'date-fns';

export const taskService = {
  async findUpcomingTasks(): Promise<TasksResponse> {
    const userId = getUserId();
    const todayDate = startOfToday().toISOString();
    try {
      const docs = await taskRepository.findUpcomingTasks(todayDate, userId);

      return docs;
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      throw new Error('Failed to load upcoming tasks. Please try again.');
    }
  },
  async findTodayTasks(): Promise<TasksResponse> {
    const userId = getUserId();
    const todayStart = startOfToday().toISOString();
    const tomorrowStart = startOfTomorrow().toISOString();
    try {
      const docs = await taskRepository.findTodayTasks(todayStart, tomorrowStart, userId);

      return docs;
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      throw new Error("Failed to load today's tasks. Please try again.");
    }
  },
  async findInboxTasks(): Promise<TasksResponse> {
    const userId = getUserId();
    try {
      const docs = await taskRepository.findInboxTasks(userId);

      return docs;
    } catch (error) {
      console.error('Error fetching inbox tasks:', error);
      throw new Error("Failed to load inbox's tasks. Please try again.");
    }
  },
  async findCompletedTasks(): Promise<TasksResponse> {
    const userId = getUserId();
    try {
      const docs = await taskRepository.findCompletedTasks(userId);

      return docs;
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      throw new Error('Failed to load completed tasks. Please try again.');
    }
  },

  async countInboxTasks(): Promise<number> {
    const userId = getUserId();
    try {
      const total = await taskRepository.countInboxTasks(userId);

      return total;
    } catch (error) {
      console.error('Error fetching inbox task count:', error);
      throw new Error('Failed to load inbox task count');
    }
  },
  async countTodayTasks(): Promise<number> {
    const userId = getUserId();
    const todayDate = startOfToday().toISOString();
    const tomorrowDate = startOfTomorrow().toISOString();
    try {
      const total = await taskRepository.countTodayTasks(todayDate, tomorrowDate, userId);

      return total;
    } catch (error) {
      console.error('Error fetching today task count:', error);
      throw new Error('Failed to load today task count');
    }
  },
  async countTasks(): Promise<TaskCounts> {
    const [inboxTasks, todayTasks] = await Promise.all([taskService.countInboxTasks(), taskService.countTodayTasks()]);

    return { inboxTasks, todayTasks };
  },

  async createMany(projectId: string, tasks: AIGeneratedTask[]): Promise<Task[]> {
    const userId = getUserId();
    try {
      const mapedTasks = tasks.map((task) => ({
        content: task.content,
        due_date: task.due_date || null,
        completed: task.completed || false,
        projectId,
        userId,
      }));

      const docs = await taskRepository.createMany(mapedTasks);

      return docs;
    } catch (error) {
      console.error('Error creating tasks for project:', error);
      throw new Error('Failed to create project tasks');
    }
  },
  async create(data: TaskFormInput): Promise<Task> {
    const userId = getUserId();
    try {
      const payload = {
        content: data.content,
        due_date: data.due_date,
        completed: data.completed || false,
        projectId: data.projectId,
        userId,
      };

      const doc = await taskRepository.create(generateID(), payload);

      return doc;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  },
  async update(taskId: string, data: Omit<TaskFormInput, 'id'>): Promise<Task> {
    try {
      const doc = await taskRepository.update(taskId, data);

      return doc;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  },
  async delete(taskId: string): Promise<void> {
    try {
      await taskRepository.delete(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  },
};
