import { databases, Query } from '@/lib/appwrite';
import { startOfToday, startOfTomorrow } from 'date-fns';
import { getUserId } from '@/lib/utils';
import type { LoaderFunction } from 'react-router';
import { env } from '@/config/env';

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
