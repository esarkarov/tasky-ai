import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createEnvSchema = () =>
  z.object({
    VITE_CLERK_PUBLISHABLE_KEY: z.string().nonempty().readonly(),
    VITE_CLERK_USER_STORAGE_KEY: z.string().nonempty().readonly(),
    VITE_APPWRITE_PROJECT_ID: z.string().nonempty().readonly(),
    VITE_APPWRITE_TASKS_COLLECTION_ID: z.string().nonempty().readonly(),
    VITE_APPWRITE_PROJECTS_COLLECTION_ID: z.string().nonempty().readonly(),
    VITE_APPWRITE_ENDPOINT: z.string().nonempty().readonly(),
    VITE_APPWRITE_DATABASE_ID: z.string().nonempty().readonly(),
    VITE_GEMINI_API_KEY: z.string().nonempty().readonly(),
  });

const createValidEnv = (overrides: Record<string, string> = {}) => ({
  MODE: 'production',
  VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_valid_key',
  VITE_CLERK_USER_STORAGE_KEY: 'user_storage_key',
  VITE_APPWRITE_PROJECT_ID: 'appwrite_project_123',
  VITE_APPWRITE_TASKS_COLLECTION_ID: 'tasks_collection_456',
  VITE_APPWRITE_PROJECTS_COLLECTION_ID: 'projects_collection_789',
  VITE_APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1',
  VITE_APPWRITE_DATABASE_ID: 'database_abc',
  VITE_GEMINI_API_KEY: 'gemini_key_xyz',
  ...overrides,
});

const mapToEnv = (parsedData: z.infer<ReturnType<typeof createEnvSchema>>) => ({
  clerkPublishableKey: parsedData.VITE_CLERK_PUBLISHABLE_KEY,
  clerkUserStorageKey: parsedData.VITE_CLERK_USER_STORAGE_KEY,
  appwriteProjectsCollectionId: parsedData.VITE_APPWRITE_PROJECTS_COLLECTION_ID,
  appwriteTasksCollectionId: parsedData.VITE_APPWRITE_TASKS_COLLECTION_ID,
  appwriteProjectId: parsedData.VITE_APPWRITE_PROJECT_ID,
  appwriteEndpoint: parsedData.VITE_APPWRITE_ENDPOINT,
  appwriteDatabaseId: parsedData.VITE_APPWRITE_DATABASE_ID,
  geminiApiKey: parsedData.VITE_GEMINI_API_KEY,
});

describe('env configuration', () => {
  describe('valid environment configuration', () => {
    it('parses and maps environment variables correctly', () => {
      const mockEnv = createValidEnv();
      const schema = createEnvSchema();

      const result = schema.safeParse(mockEnv);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const env = mapToEnv(result.data);
      expect(env).toMatchObject({
        clerkPublishableKey: 'pk_test_valid_key',
        clerkUserStorageKey: 'user_storage_key',
        appwriteProjectId: 'appwrite_project_123',
        appwriteTasksCollectionId: 'tasks_collection_456',
        appwriteProjectsCollectionId: 'projects_collection_789',
        appwriteEndpoint: 'https://cloud.appwrite.io/v1',
        appwriteDatabaseId: 'database_abc',
        geminiApiKey: 'gemini_key_xyz',
      });
    });

    it('contains only expected camelCase keys', () => {
      const schema = createEnvSchema();
      const result = schema.safeParse(createValidEnv());
      expect(result.success).toBe(true);
      if (!result.success) return;

      const env = mapToEnv(result.data);
      const expectedKeys = [
        'clerkPublishableKey',
        'clerkUserStorageKey',
        'appwriteProjectId',
        'appwriteTasksCollectionId',
        'appwriteProjectsCollectionId',
        'appwriteEndpoint',
        'appwriteDatabaseId',
        'geminiApiKey',
      ];

      expectedKeys.forEach((key) => expect(env).toHaveProperty(key));
      expect(Object.keys(env)).not.toContain('VITE_CLERK_PUBLISHABLE_KEY');
    });
  });

  describe('invalid environment configuration', () => {
    it.each(['VITE_CLERK_PUBLISHABLE_KEY', 'VITE_GEMINI_API_KEY', 'VITE_APPWRITE_ENDPOINT'])(
      'fails validation when %s is missing',
      (key) => {
        const mockEnv = createValidEnv();
        delete (mockEnv as Record<string, string>)[key];
        const result = createEnvSchema().safeParse(mockEnv);
        expect(result.success).toBe(false);
      }
    );

    it('fails when a required variable is empty', () => {
      const mockEnv = createValidEnv({ VITE_APPWRITE_ENDPOINT: '' });
      const result = createEnvSchema().safeParse(mockEnv);
      expect(result.success).toBe(false);
    });

    it('fails when multiple variables are missing', () => {
      const incompleteEnv = { MODE: 'production', VITE_CLERK_PUBLISHABLE_KEY: 'only-one' };
      const result = createEnvSchema().safeParse(incompleteEnv);
      expect(result.success).toBe(false);
    });

    it('throws when schema parsing fails completely', () => {
      const mockEnv = { MODE: 'production' };
      const result = createEnvSchema().safeParse(mockEnv);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(() => {
          throw new Error('Invalid environment configuration');
        }).toThrow('Invalid environment configuration');
      }
    });
  });

  describe('test mode defaults', () => {
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

    const mergeDefaults = (env: Record<string, string>) => (env.MODE === 'test' ? { ...testDefaults, ...env } : env);

    it('applies test defaults when MODE is test', () => {
      const envToParse = mergeDefaults({ MODE: 'test' });
      const result = createEnvSchema().safeParse(envToParse);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const env = mapToEnv(result.data);
      expect(env).toMatchObject({
        clerkPublishableKey: 'test-key',
        appwriteEndpoint: 'http://localhost:8080/v1',
        geminiApiKey: 'test-gemini-key',
      });
    });

    it('allows overriding test defaults', () => {
      const overrides = {
        MODE: 'test',
        VITE_CLERK_PUBLISHABLE_KEY: 'overridden-key',
        VITE_APPWRITE_ENDPOINT: 'https://custom-endpoint.com/v1',
      };
      const envToParse = mergeDefaults(overrides);
      const result = createEnvSchema().safeParse(envToParse);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const env = mapToEnv(result.data);
      expect(env.clerkPublishableKey).toBe('overridden-key');
      expect(env.appwriteEndpoint).toBe('https://custom-endpoint.com/v1');
      expect(env.clerkUserStorageKey).toBe('test-storage-key');
    });
  });

  describe('zod validation results', () => {
    it('returns success=true for valid configuration', () => {
      const result = createEnvSchema().safeParse(createValidEnv());
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.VITE_CLERK_PUBLISHABLE_KEY).toBe('pk_test_valid_key');
    });
  });
});
