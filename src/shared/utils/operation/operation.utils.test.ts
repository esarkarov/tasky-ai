import { TIMING } from '@/shared/constants/timing';
import { MAX_PROJECT_NAME_TRUNCATE_LENGTH, MAX_TASK_CONTENT_TRUNCATE_LENGTH } from '@/shared/constants/validation';
import { OperationResult } from '@/shared/types';
import {
  buildProjectSuccessDescription,
  buildSearchUrl,
  buildTaskSuccessDescription,
  executeWithToast,
} from '@/shared/utils/operation/operation.utils';
import { truncateString } from '@/shared/utils/text/text.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/constants/timing', () => ({
  TIMING: {
    TOAST_DURATION: 5000,
  },
}));

vi.mock('@/shared/constants/validation', () => ({
  MAX_PROJECT_NAME_TRUNCATE_LENGTH: 30,
  MAX_TASK_CONTENT_TRUNCATE_LENGTH: 50,
}));

vi.mock('@/shared/utils/text/text.utils', () => ({
  truncateString: vi.fn(),
}));

const mockedTruncateString = vi.mocked(truncateString);

describe('operation utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeWithToast', () => {
    const MOCK_TOAST_ID = 'toast-123';
    const DEFAULT_MESSAGES = {
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error!',
      errorDescription: 'Something went wrong',
    };

    interface ToastSetup {
      operation: ReturnType<typeof vi.fn>;
      toastHandler: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      onSuccess?: ReturnType<typeof vi.fn>;
    }

    const setupToastMocks = (operationResult: OperationResult): ToastSetup => {
      const operation = vi.fn();
      const toastHandler = vi.fn();
      const update = vi.fn();
      const onSuccess = vi.fn();

      if (operationResult === 'success') {
        operation.mockResolvedValue('result');
      } else {
        operation.mockRejectedValue(new Error('Operation failed'));
      }

      toastHandler.mockReturnValue({ id: MOCK_TOAST_ID, update });

      return { operation, toastHandler, update, onSuccess };
    };

    it('should show loading toast, execute operation, and show success toast', async () => {
      const { operation, toastHandler, update, onSuccess } = setupToastMocks('success');
      const successDescription = 'Operation completed successfully';

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription, onSuccess);

      expect(toastHandler).toHaveBeenCalledWith({
        title: DEFAULT_MESSAGES.loading,
        duration: TIMING.TOAST_DURATION,
      });
      expect(operation).toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith({
        id: MOCK_TOAST_ID,
        title: DEFAULT_MESSAGES.success,
        description: successDescription,
        className: 'border-l-4 border-[#ea580c]',
      });
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should show error toast when operation fails', async () => {
      const { operation, toastHandler, update, onSuccess } = setupToastMocks('error');
      const successDescription = 'Operation completed successfully';

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription, onSuccess);

      expect(toastHandler).toHaveBeenCalledWith({
        title: DEFAULT_MESSAGES.loading,
        duration: TIMING.TOAST_DURATION,
      });
      expect(operation).toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith({
        id: MOCK_TOAST_ID,
        title: DEFAULT_MESSAGES.error,
        description: DEFAULT_MESSAGES.errorDescription,
        variant: 'destructive',
      });
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should handle optional onSuccess callback', async () => {
      const { operation, toastHandler, update } = setupToastMocks('success');
      const successDescription = 'Operation completed successfully';

      await executeWithToast(operation, toastHandler, DEFAULT_MESSAGES, successDescription);

      expect(operation).toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith({
        id: MOCK_TOAST_ID,
        title: DEFAULT_MESSAGES.success,
        description: successDescription,
        className: 'border-l-4 border-[#ea580c]',
      });
    });
  });

  describe('buildTaskSuccessDescription', () => {
    const mockTruncateMessages = [
      {
        description: 'default max length',
        content: 'This is a very long task description that should be truncated',
        prefix: 'Task created',
        maxLength: MAX_TASK_CONTENT_TRUNCATE_LENGTH,
        truncatedContent: 'This is a very long task description tha...',
      },
      {
        description: 'custom max length',
        content: 'Short task',
        prefix: 'Task updated',
        maxLength: MAX_TASK_CONTENT_TRUNCATE_LENGTH,
        truncatedContent: 'Short task',
      },
      {
        description: 'empty content',
        content: '',
        prefix: 'Task created',
        maxLength: MAX_TASK_CONTENT_TRUNCATE_LENGTH,
        truncatedContent: '',
      },
    ];

    const setupTruncateMock = (truncatedResult: string) => {
      mockedTruncateString.mockReturnValue(truncatedResult);
    };

    it.each(mockTruncateMessages)(
      'should build description with $description',
      ({ content, prefix, maxLength, truncatedContent }) => {
        setupTruncateMock(truncatedContent);

        const result = buildTaskSuccessDescription(content, prefix);

        expect(mockedTruncateString).toHaveBeenCalledWith(content, maxLength);
        expect(result).toBe(`${prefix} "${truncatedContent}"`);
      }
    );
  });

  describe('buildProjectSuccessDescription', () => {
    const mockProjectMessages = [
      {
        scenario: 'created project without AI tasks',
        projectName: 'My Awesome Project',
        truncatedName: 'My Awesome Project',
        hasAITasks: false,
        method: 'POST' as const,
        expected: 'The project My Awesome Project has been successfully created.',
      },
      {
        scenario: 'updated project with AI tasks',
        projectName: 'My Updated Project',
        truncatedName: 'My Updated Project',
        hasAITasks: true,
        method: 'PUT' as const,
        expected: 'The project My Updated Project and its tasks have been successfully updated.',
      },
      {
        scenario: 'long project name',
        projectName: 'This is a very long project name that should be truncated',
        truncatedName: 'This is a very long project na...',
        hasAITasks: false,
        method: 'POST' as const,
        expected: 'The project This is a very long project na... has been successfully created.',
      },
    ];
    const setupTruncateMock = (truncatedName: string) => {
      mockedTruncateString.mockReturnValue(truncatedName);
    };

    it.each(mockProjectMessages)(
      'should build description for $scenario',
      ({ projectName, truncatedName, hasAITasks, method, expected }) => {
        setupTruncateMock(truncatedName);

        const result = buildProjectSuccessDescription(projectName, hasAITasks, method);

        expect(mockedTruncateString).toHaveBeenCalledWith(projectName, MAX_PROJECT_NAME_TRUNCATE_LENGTH);
        expect(result).toBe(expected);
      }
    );
  });

  describe('buildSearchUrl', () => {
    const mockSearchQueries = [
      {
        description: 'simple search query',
        baseUrl: '/tasks',
        searchValue: 'my search query',
      },
      {
        description: 'special characters',
        baseUrl: '/search',
        searchValue: 'hello & world?',
        expectedEncoded: 'hello%20%26%20world%3F',
      },
    ];
    it('should return base URL when search value is empty', () => {
      const baseUrl = '/projects';
      const searchValue = '';

      const result = buildSearchUrl(baseUrl, searchValue);

      expect(result).toBe(baseUrl);
    });

    it.each(mockSearchQueries)('should build URL with $description', ({ baseUrl, searchValue, expectedEncoded }) => {
      const result = buildSearchUrl(baseUrl, searchValue);

      expect(result).toBe(`${baseUrl}?q=${encodeURIComponent(searchValue)}`);
      if (expectedEncoded) {
        expect(result).toContain(expectedEncoded);
      }
    });
  });
});
