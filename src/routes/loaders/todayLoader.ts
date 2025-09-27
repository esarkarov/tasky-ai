import { env } from '@/config/env';
import { databases, Query } from '@/lib/appwrite';
import { getUserId } from '@/lib/utils';
import { startOfToday, startOfTomorrow } from 'date-fns';
import type { LoaderFunction } from 'react-router';

const getTasks = async () => {
  try {
    return await databases.listDocuments(env.appwriteDatabaseId, 'tasks', [
      Query.equal('completed', false),
      Query.and([
        Query.greaterThanEqual('due_date', startOfToday().toISOString()),
        Query.lessThan('due_date', startOfTomorrow().toISOString()),
      ]),
      Query.equal('userId', getUserId()),
    ]);
  } catch (err) {
    console.log(err);
    throw new Error('Error getting inbox tasks');
  }
};

const todayLoader: LoaderFunction = async () => {
  const tasks = await getTasks();

  return { tasks };
};

export default todayLoader;
