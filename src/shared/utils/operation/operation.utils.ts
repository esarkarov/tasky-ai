import { TIMING } from '@/shared/constants/timing';
import { MAX_PROJECT_NAME_TRUNCATE_LENGTH, MAX_TASK_CONTENT_TRUNCATE_LENGTH } from '@/shared/constants/validation';
import { Toast } from '@/shared/hooks/use-toast';
import { HttpMethod, ToastHandler, ToastMessages } from '@/shared/types';
import { truncateString } from '@/shared/utils/text/text.utils';

export const executeWithToast = async <T>(
  operation: () => Promise<T>,
  toastHandler: (options: Toast) => ToastHandler,
  messages: ToastMessages,
  successDescription: string,
  onSuccess?: () => void
) => {
  const { id, update } = toastHandler({
    title: messages.loading,
    duration: TIMING.TOAST_DURATION,
  });

  try {
    await operation();

    update({
      id,
      title: messages.success,
      description: successDescription,
      className: 'border-l-4 border-[#ea580c]',
    });

    onSuccess?.();
  } catch {
    update({
      id,
      title: messages.error,
      description: messages.errorDescription,
      variant: 'destructive',
    });
  }
};

export const buildTaskSuccessDescription = (content: string, prefix: string) => {
  const truncated = truncateString(content, MAX_TASK_CONTENT_TRUNCATE_LENGTH);
  return `${prefix} "${truncated}"`;
};

export const buildProjectSuccessDescription = (projectName: string, hasAiGen: boolean, method: HttpMethod) => {
  const truncatedName = truncateString(projectName, MAX_PROJECT_NAME_TRUNCATE_LENGTH);
  const action = method === 'POST' ? 'created' : 'updated';
  const subject = hasAiGen ? 'and its tasks have' : 'has';

  return `The project ${truncatedName} ${hasAiGen ? subject : subject} been successfully ${action}.`;
};

export const buildSearchUrl = (baseUrl: string, searchValue: string) => {
  return searchValue ? `${baseUrl}?q=${encodeURIComponent(searchValue)}` : baseUrl;
};
