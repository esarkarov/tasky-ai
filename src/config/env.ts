import { z } from 'zod';

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string().nonempty().readonly(),
  VITE_CLERK_USER_STORAGE_KEY: z.string().nonempty().readonly(),
  VITE_APPWRITE_PROJECT_ID: z.string().nonempty().readonly(),
  VITE_APPWRITE_ENDPOINT: z.string().nonempty().readonly(),
  VITE_APPWRITE_DATABASE_ID: z.string().nonempty().readonly(),
});

export const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.message);
  throw new Error('Invalid environment configuration');
}

export const env = {
  clerkPublishableKey: parsedEnv.data.VITE_CLERK_PUBLISHABLE_KEY,
  clerkUserStorageKey: parsedEnv.data.VITE_CLERK_USER_STORAGE_KEY,
  appwriteProjectId: parsedEnv.data.VITE_APPWRITE_PROJECT_ID,
  appwriteEndpoint: parsedEnv.data.VITE_APPWRITE_ENDPOINT,
  appwriteDatabaseId: parsedEnv.data.VITE_APPWRITE_DATABASE_ID,
};