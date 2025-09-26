import { databases, Query } from '@/lib/appwrite';
import { redirect } from 'react-router';
import { getUserId } from '@/lib/utils';
import { env } from '@/config/env';
import { PATHS } from '@/constants';
import type { LoaderFunction } from 'react-router';

const getProjects = async () => {
  try {
    return await databases.listDocuments(env.appwriteDatabaseId, 'projects', [
      Query.select(['$id', 'name', 'color_name', 'color_hex', '$createdAt']),
      Query.orderDesc('$createdAt'),
      Query.limit(100),
      Query.equal('userId', getUserId()),
    ]);
  } catch (err) {
    console.log('Error getting projects: ', err);
    throw new Error('Error getting projects');
  }
};

const appLoader: LoaderFunction = async () => {
  const userId = getUserId();

  if (!userId) return redirect(PATHS.LOGIN);

  const projects = await getProjects();

  return { projects };
};

export default appLoader;
