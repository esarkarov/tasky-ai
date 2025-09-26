import { databases, Query } from '@/lib/appwrite';
import { startOfToday } from 'date-fns';
import { getUserId } from '@/lib/utils';
import type { LoaderFunction } from 'react-router';
import { env } from '@/config/env';

const getTasks = async () => {
  try {
    return await databases.listDocuments(env.appwriteDatabaseId, 'tasks', [
      Query.equal('completed', false),
      Query.isNotNull('due_date'),
      Query.greaterThanEqual('due_date', startOfToday().toISOString()),
      Query.orderAsc('due_date'),
      Query.equal('userId', getUserId()),
    ]);
  } catch (err) {
    console.log(err);
    throw new Error('Error getting upcoming tasks');
  }
};

const upcomingLoader: LoaderFunction = async () => {
  const tasks = await getTasks();

  return { tasks };
};

export default upcomingLoader;
