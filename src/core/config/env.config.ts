import { z } from 'zod';

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string().nonempty().readonly(),
  VITE_CLERK_USER_STORAGE_KEY: z.string().nonempty().readonly(),
  VITE_APPWRITE_PROJECT_ID: z.string().nonempty().readonly(),
  VITE_APPWRITE_TASKS_COLLECTION_ID: z.string().nonempty().readonly(),
  VITE_APPWRITE_PROJECTS_COLLECTION_ID: z.string().nonempty().readonly(),
  VITE_APPWRITE_ENDPOINT: z.string().nonempty().readonly(),
  VITE_APPWRITE_DATABASE_ID: z.string().nonempty().readonly(),
  VITE_GEMINI_API_KEY: z.string().nonempty().readonly(),
});

const testDefaults = {
  VITE_CLERK_PUBLISHABLE_KEY: 'test-key',
  VITE_CLERK_USER_STORAGE_KEY: 'test-storage-key',
  VITE_APPWRITE_PROJECT_ID: 'test-project-id',
  VITE_APPWRITE_TASKS_COLLECTION_ID: 'test-tasks-collection',
  VITE_APPWRITE_PROJECTS_COLLECTION_ID: 'test-projects-collection',
  VITE_APPWRITE_ENDPOINT: 'http://localhost:8080/v1',
  VITE_APPWRITE_DATABASE_ID: 'test-database-id',
  VITE_GEMINI_API_KEY: 'test-gemini-key',
};

const envToParse = import.meta.env.MODE === 'test' ? { ...testDefaults, ...import.meta.env } : import.meta.env;

export const parsedEnv = envSchema.safeParse(envToParse);

if (!parsedEnv.success) {
  throw new Error('Invalid environment configuration');
}

export const env = {
  clerkPublishableKey: parsedEnv.data.VITE_CLERK_PUBLISHABLE_KEY,
  clerkUserStorageKey: parsedEnv.data.VITE_CLERK_USER_STORAGE_KEY,
  appwriteProjectsCollectionId: parsedEnv.data.VITE_APPWRITE_PROJECTS_COLLECTION_ID,
  appwriteTasksCollectionId: parsedEnv.data.VITE_APPWRITE_TASKS_COLLECTION_ID,
  appwriteProjectId: parsedEnv.data.VITE_APPWRITE_PROJECT_ID,
  appwriteEndpoint: parsedEnv.data.VITE_APPWRITE_ENDPOINT,
  appwriteDatabaseId: parsedEnv.data.VITE_APPWRITE_DATABASE_ID,
  geminiApiKey: parsedEnv.data.VITE_GEMINI_API_KEY,
};
