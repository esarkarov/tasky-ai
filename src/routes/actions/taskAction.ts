import { env } from '@/config/env';
import { HTTP_METHODS } from '@/constants';
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

const updateTask = async (data: ITask) => {
  const documentId = data.id;

  if (!documentId) throw new Error('Task id not found.');

  delete data.id;

  try {
    return await databases.updateDocument(
      env.appwriteDatabaseId,
      'tasks',
      documentId,
      data,
    );
  } catch (err) {
    console.log(err);
  }
};

const deleteTask = async (data: ITask) => {
  const documentId = data.id;

  if (!documentId) throw new Error('Task id not found.');

  try {
    await databases.deleteDocument(env.appwriteDatabaseId, 'tasks', documentId);
  } catch (err) {
    console.log(err);
  }
};

const taskAction: ActionFunction = async ({ request }) => {
  const data = (await request.json()) as ITask;

  if (request.method === HTTP_METHODS.POST) {
    return await createTask(data);
  }

  if (request.method === HTTP_METHODS.PUT) {
    return await updateTask(data);
  }

  if (request.method === HTTP_METHODS.DELETE) {
    return await deleteTask(data);
  }
};

export default taskAction;
