import { describe, expect, it } from 'vitest';
import { envSchema, EnvSchema, testDefaults } from './env.config';

const productionEnv: EnvSchema = {
  VITE_CLERK_PUBLISHABLE_KEY: 'pk_live_abc123',
  VITE_CLERK_USER_STORAGE_KEY: 'user_storage_key',
  VITE_APPWRITE_PROJECT_ID: 'prod_project_123',
  VITE_APPWRITE_TASKS_COLLECTION_ID: 'tasks_456',
  VITE_APPWRITE_PROJECTS_COLLECTION_ID: 'projects_789',
  VITE_APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1',
  VITE_APPWRITE_DATABASE_ID: 'main_db',
  VITE_GEMINI_API_KEY: 'AIzaSy_real_key',
};

const mapToEnv = (data: EnvSchema) => ({
  clerkPublishableKey: data.VITE_CLERK_PUBLISHABLE_KEY,
  clerkUserStorageKey: data.VITE_CLERK_USER_STORAGE_KEY,
  appwriteProjectsCollectionId: data.VITE_APPWRITE_PROJECTS_COLLECTION_ID,
  appwriteTasksCollectionId: data.VITE_APPWRITE_TASKS_COLLECTION_ID,
  appwriteProjectId: data.VITE_APPWRITE_PROJECT_ID,
  appwriteEndpoint: data.VITE_APPWRITE_ENDPOINT,
  appwriteDatabaseId: data.VITE_APPWRITE_DATABASE_ID,
  geminiApiKey: data.VITE_GEMINI_API_KEY,
});

describe('env configuration', () => {
  describe('validation with complete configuration', () => {
    it('should parse production environment variables successfully', () => {
      const envData = productionEnv;

      const result = envSchema.safeParse(envData);

      expect(result.success).toBe(true);
    });

    it('should map environment variables to camelCase properties', () => {
      const envData = productionEnv;

      const result = envSchema.safeParse(envData);
      const env = result.success ? mapToEnv(result.data) : null;

      expect(env).toEqual({
        clerkPublishableKey: 'pk_live_abc123',
        clerkUserStorageKey: 'user_storage_key',
        appwriteProjectId: 'prod_project_123',
        appwriteTasksCollectionId: 'tasks_456',
        appwriteProjectsCollectionId: 'projects_789',
        appwriteEndpoint: 'https://cloud.appwrite.io/v1',
        appwriteDatabaseId: 'main_db',
        geminiApiKey: 'AIzaSy_real_key',
      });
    });

    it('should not contain VITE_ prefixed keys in mapped output', () => {
      const envData = productionEnv;

      const result = envSchema.safeParse(envData);
      const env = result.success ? mapToEnv(result.data) : null;

      expect(env).toBeDefined();
      expect(Object.keys(env!)).not.toContain('VITE_CLERK_PUBLISHABLE_KEY');
      expect(Object.keys(env!)).not.toContain('VITE_GEMINI_API_KEY');
    });
  });

  describe('validation with missing variables', () => {
    it('should fail when required variable is missing', () => {
      const { VITE_CLERK_PUBLISHABLE_KEY, ...incomplete } = productionEnv;

      const result = envSchema.safeParse(incomplete);

      expect(result.success).toBe(false);
    });

    it('should fail when variable is empty string', () => {
      const envData = { ...productionEnv, VITE_APPWRITE_ENDPOINT: '' };

      const result = envSchema.safeParse(envData);

      expect(result.success).toBe(false);
    });

    it('should fail when multiple variables are missing', () => {
      const envData = { VITE_CLERK_PUBLISHABLE_KEY: 'only-one' };

      const result = envSchema.safeParse(envData);

      expect(result.success).toBe(false);
    });
  });

  describe('test mode with defaults', () => {
    it('should use test defaults for all variables', () => {
      const envData = testDefaults;

      const result = envSchema.safeParse(envData);
      const env = result.success ? mapToEnv(result.data) : null;

      expect(env).toEqual({
        clerkPublishableKey: 'test-key',
        clerkUserStorageKey: 'test-storage-key',
        appwriteProjectId: 'test-project-id',
        appwriteTasksCollectionId: 'test-tasks-collection',
        appwriteProjectsCollectionId: 'test-projects-collection',
        appwriteEndpoint: 'http://localhost:8080/v1',
        appwriteDatabaseId: 'test-database-id',
        geminiApiKey: 'test-gemini-key',
      });
    });

    it('should allow overriding specific test defaults', () => {
      const envData = {
        ...testDefaults,
        VITE_CLERK_PUBLISHABLE_KEY: 'custom-key',
        VITE_APPWRITE_ENDPOINT: 'https://custom.io/v1',
      };

      const result = envSchema.safeParse(envData);
      const env = result.success ? mapToEnv(result.data) : null;

      expect(env?.clerkPublishableKey).toBe('custom-key');
      expect(env?.appwriteEndpoint).toBe('https://custom.io/v1');
      expect(env?.clerkUserStorageKey).toBe('test-storage-key');
    });
  });

  describe('error handling', () => {
    it('should return error details when validation fails', () => {
      const envData = {};

      const result = envSchema.safeParse(envData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
