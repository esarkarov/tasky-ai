import { env } from '@/config/env';
import { databases, Query } from '@/lib/appwrite';
import { getUserId } from '@/lib/utils';
import type { LoaderFunction } from 'react-router';

const getTasks = async () => {
  try {
    return await databases.listDocuments(env.appwriteDatabaseId, 'tasks', [
      Query.equal('completed', true),
      Query.orderDesc('$updatedAt'),
      Query.equal('userId', getUserId()),
    ]);
  } catch (err) {
    console.log(err);
    throw new Error('Error getting completed tasks');
  }
};

const completedLoader: LoaderFunction = async () => {
  const tasks = await getTasks();

  return { tasks };
};

export default completedLoader;
