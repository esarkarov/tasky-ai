import { env } from '@/core/config/env.config';
import { databases } from '@/core/lib/appwrite';
import { taskQueries } from '@/features/tasks/repositories/task.queries';
import { TaskCreateInput, TaskEntity, TasksResponse, TaskUpdateInput } from '@/features/tasks/types';
import { generateID } from '@/shared/utils/text/text.utils';

export const taskRepository = {
  countTodayTasks: async (todayDate: string, tomorrowDate: string, userId: string): Promise<number> => {
    const { total } = await databases.listDocuments<TaskEntity>(
      env.appwriteDatabaseId,
      env.appwriteTasksCollectionId,
      taskQueries.forTodayTasksCount(todayDate, tomorrowDate, userId)
    );
    return total;
  },
  countInboxTasks: async (userId: string): Promise<number> => {
    const { total } = await databases.listDocuments<TaskEntity>(
      env.appwriteDatabaseId,
      env.appwriteTasksCollectionId,
      taskQueries.forInboxTasksCount(userId)
    );
    return total;
  },
  findCompletedTasks: (userId: string): Promise<TasksResponse> =>
    databases.listDocuments<TaskEntity>(
      env.appwriteDatabaseId,
      env.appwriteTasksCollectionId,
      taskQueries.forCompletedTasks(userId)
    ),
  findInboxTasks: (userId: string): Promise<TasksResponse> =>
    databases.listDocuments<TaskEntity>(
      env.appwriteDatabaseId,
      env.appwriteTasksCollectionId,
      taskQueries.forInboxTasks(userId)
    ),
  findTodayTasks: (todayDate: string, tomorrowDate: string, userId: string): Promise<TasksResponse> =>
    databases.listDocuments<TaskEntity>(
      env.appwriteDatabaseId,
      env.appwriteTasksCollectionId,
      taskQueries.forTodayTasks(todayDate, tomorrowDate, userId)
    ),
  findUpcomingTasks: (todayDate: string, userId: string): Promise<TasksResponse> =>
    databases.listDocuments<TaskEntity>(
      env.appwriteDatabaseId,
      env.appwriteTasksCollectionId,
      taskQueries.forUpcomingTasks(todayDate, userId)
    ),

  createMany: (tasks: Array<TaskCreateInput & { id?: string }>): Promise<TaskEntity[]> =>
    Promise.all(
      tasks.map((task) => {
        const { id, ...data } = task;
        const docId = id ?? generateID();
        return taskRepository.create(docId, data as TaskCreateInput);
      })
    ),
  create: (id: string, data: TaskCreateInput): Promise<TaskEntity> =>
    databases.createDocument<TaskEntity>(env.appwriteDatabaseId, env.appwriteTasksCollectionId, id, data),
  update: (id: string, data: TaskUpdateInput): Promise<TaskEntity> =>
    databases.updateDocument<TaskEntity>(env.appwriteDatabaseId, env.appwriteTasksCollectionId, id, data),
  delete: (id: string) => databases.deleteDocument(env.appwriteDatabaseId, env.appwriteTasksCollectionId, id),
};
