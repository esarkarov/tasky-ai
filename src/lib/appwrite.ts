import { env } from '@/config/env';
import { Client, Databases, ID, Query } from 'appwrite';

const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId);

const databases = new Databases(client);

export { databases, ID, Query };
