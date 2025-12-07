import { MAX_PROJECT_NAME_TRUNCATE_LENGTH, MAX_TASK_CONTENT_TRUNCATE_LENGTH, TIMING } from '@/shared/constants';
import {
  buildProjectSuccessDescription,
  buildSearchUrl,
  buildTaskSuccessDescription,
  executeWithToast,
} from '@/shared/utils/operation/operation.utils';
import { truncateString } from '@/shared/utils/text/text.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/constants', () => ({
  TIMING: {
    TOAST_DURATION: 5000,
  },
  MAX_PROJECT_NAME_TRUNCATE_LENGTH: 30,
  MAX_TASK_CONTENT_TRUNCATE_LENGTH: 50,
}));

vi.mock('@/shared/utils/text/text.utils', () => ({
  truncateString: vi.fn(),
}));

const mockTruncateString = vi.mocked(truncateString);

describe('operation utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeWithToast', () => {
    const MOCK_TOAST_ID = 'toast-123';
    const DEFAULT_MESSAGES = {
      loading: 'Processing...',
      success: 'Success!',
      error: 'Error occurred',
      errorDescription: 'Something went wrong',
    };

    it('should show loading toast when operation starts', async () => {
      const operation = vi.fn().mockResolvedValue('result');
      const toastHandler = vi.fn().mockReturnValue({ id: MOCK_TOAST_ID, update: vi.fn() });
      const successDescription = 'Task created successfully';

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription);

      expect(toastHandler).toHaveBeenCalledWith({
        title: DEFAULT_MESSAGES.loading,
        duration: TIMING.TOAST_DURATION,
      });
      expect(toastHandler).toHaveBeenCalledOnce();
    });

    it('should execute operation after showing loading toast', async () => {
      const operation = vi.fn().mockResolvedValue('result');
      const toastHandler = vi.fn().mockReturnValue({ id: MOCK_TOAST_ID, update: vi.fn() });
      const successDescription = 'Task created successfully';

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription);

      expect(operation).toHaveBeenCalledOnce();
    });

    it('should show success toast when operation succeeds', async () => {
      const operation = vi.fn().mockResolvedValue('result');
      const update = vi.fn();
      const toastHandler = vi.fn().mockReturnValue({ id: MOCK_TOAST_ID, update });
      const successDescription = 'Task created successfully';

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription);

      expect(update).toHaveBeenCalledWith({
        id: MOCK_TOAST_ID,
        title: DEFAULT_MESSAGES.success,
        description: successDescription,
        className: 'border-l-4 border-[#ea580c]',
      });
      expect(update).toHaveBeenCalledOnce();
    });

    it('should call onSuccess callback when operation succeeds', async () => {
      const operation = vi.fn().mockResolvedValue('result');
      const toastHandler = vi.fn().mockReturnValue({ id: MOCK_TOAST_ID, update: vi.fn() });
      const successDescription = 'Task created successfully';
      const onSuccess = vi.fn();

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription, onSuccess);

      expect(onSuccess).toHaveBeenCalledOnce();
    });

    it('should not call onSuccess callback when callback is not provided', async () => {
      const operation = vi.fn().mockResolvedValue('result');
      const toastHandler = vi.fn().mockReturnValue({ id: MOCK_TOAST_ID, update: vi.fn() });
      const successDescription = 'Task created successfully';

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription);

      expect(operation).toHaveBeenCalledOnce();
    });

    it('should show error toast when operation fails', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));
      const update = vi.fn();
      const toastHandler = vi.fn().mockReturnValue({ id: MOCK_TOAST_ID, update });
      const successDescription = 'Task created successfully';

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription);

      expect(update).toHaveBeenCalledWith({
        id: MOCK_TOAST_ID,
        title: DEFAULT_MESSAGES.error,
        description: DEFAULT_MESSAGES.errorDescription,
        variant: 'destructive',
      });
      expect(update).toHaveBeenCalledOnce();
    });

    it('should not call onSuccess callback when operation fails', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));
      const toastHandler = vi.fn().mockReturnValue({ id: MOCK_TOAST_ID, update: vi.fn() });
      const successDescription = 'Task created successfully';
      const onSuccess = vi.fn();

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription, onSuccess);

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('buildTaskSuccessDescription', () => {
    it('should truncate task content to max length', () => {
      const taskContent = 'This is a very long task description';
      const prefix = 'Task created';
      const truncatedContent = 'This is a very long task desc...';
      mockTruncateString.mockReturnValue(truncatedContent);

      buildTaskSuccessDescription(taskContent, prefix);

      expect(mockTruncateString).toHaveBeenCalledWith(taskContent, MAX_TASK_CONTENT_TRUNCATE_LENGTH);
      expect(mockTruncateString).toHaveBeenCalledOnce();
    });

    it('should return formatted description with prefix and truncated content', () => {
      const taskContent = 'Short task';
      const prefix = 'Task updated';
      const truncatedContent = 'Short task';
      mockTruncateString.mockReturnValue(truncatedContent);

      const result = buildTaskSuccessDescription(taskContent, prefix);

      expect(result).toBe('Task updated "Short task"');
    });

    it('should handle empty task content', () => {
      const taskContent = '';
      const prefix = 'Task created';
      mockTruncateString.mockReturnValue('');

      const result = buildTaskSuccessDescription(taskContent, prefix);

      expect(result).toBe('Task created ""');
    });
  });

  describe('buildProjectSuccessDescription', () => {
    it('should truncate project name to max length', () => {
      const projectName = 'My Awesome Project';
      const hasAiGen = false;
      const method = 'POST' as const;
      mockTruncateString.mockReturnValue(projectName);

      buildProjectSuccessDescription(projectName, hasAiGen, method);

      expect(mockTruncateString).toHaveBeenCalledWith(projectName, MAX_PROJECT_NAME_TRUNCATE_LENGTH);
      expect(mockTruncateString).toHaveBeenCalledOnce();
    });

    it('should return created message when method is POST without AI tasks', () => {
      const projectName = 'My Project';
      const hasAiGen = false;
      const method = 'POST' as const;
      mockTruncateString.mockReturnValue(projectName);

      const result = buildProjectSuccessDescription(projectName, hasAiGen, method);

      expect(result).toBe('The project My Project has been successfully created.');
    });

    it('should return created message when method is POST with AI tasks', () => {
      const projectName = 'My Project';
      const hasAiGen = true;
      const method = 'POST' as const;
      mockTruncateString.mockReturnValue(projectName);

      const result = buildProjectSuccessDescription(projectName, hasAiGen, method);

      expect(result).toBe('The project My Project and its tasks have been successfully created.');
    });

    it('should return updated message when method is PUT without AI tasks', () => {
      const projectName = 'My Project';
      const hasAiGen = false;
      const method = 'PUT' as const;
      mockTruncateString.mockReturnValue(projectName);

      const result = buildProjectSuccessDescription(projectName, hasAiGen, method);

      expect(result).toBe('The project My Project has been successfully updated.');
    });

    it('should return updated message when method is PUT with AI tasks', () => {
      const projectName = 'My Project';
      const hasAiGen = true;
      const method = 'PUT' as const;
      mockTruncateString.mockReturnValue(projectName);

      const result = buildProjectSuccessDescription(projectName, hasAiGen, method);

      expect(result).toBe('The project My Project and its tasks have been successfully updated.');
    });

    it('should use truncated name in message', () => {
      const projectName = 'This is a very long project name that should be truncated';
      const truncatedName = 'This is a very long project na...';
      const hasAiGen = false;
      const method = 'POST' as const;
      mockTruncateString.mockReturnValue(truncatedName);

      const result = buildProjectSuccessDescription(projectName, hasAiGen, method);

      expect(result).toBe('The project This is a very long project na... has been successfully created.');
    });
  });

  describe('buildSearchUrl', () => {
    it('should return base URL when search value is empty', () => {
      const baseUrl = '/projects';
      const searchValue = '';

      const result = buildSearchUrl(baseUrl, searchValue);

      expect(result).toBe(baseUrl);
    });

    it('should build URL with query parameter when search value is provided', () => {
      const baseUrl = '/tasks';
      const searchValue = 'my search query';

      const result = buildSearchUrl(baseUrl, searchValue);

      expect(result).toBe('/tasks?q=my%20search%20query');
    });

    it('should encode special characters in search value', () => {
      const baseUrl = '/search';
      const searchValue = 'hello & world?';

      const result = buildSearchUrl(baseUrl, searchValue);

      expect(result).toBe('/search?q=hello%20%26%20world%3F');
    });

    it('should handle search value with multiple special characters', () => {
      const baseUrl = '/items';
      const searchValue = 'task #1 @home (urgent)';

      const result = buildSearchUrl(baseUrl, searchValue);

      expect(result).toContain('?q=');
      expect(result).toBe(`/items?q=${encodeURIComponent(searchValue)}`);
    });
  });
});
