import { env } from '@/config/env';
import { ITask } from '@/interfaces';
import { databases } from '@/lib/appwrite';
import { generateID, getUserId } from '@/lib/utils';
import { ActionFunction } from 'react-router';

const createTask = async (data: ITask) => {
  try {
    return await databases.createDocument(
      env.appwriteDatabaseId,
      'tasks',
      generateID(),
      { ...data, userId: getUserId() },
    );
  } catch (err) {
    console.log(err);
  }
};

const appAction: ActionFunction = async ({ request }) => {
  const data = (await request.json()) as ITask;

  if (request.method === 'POST') {
    return await createTask(data);
  }
};

export default appAction;
