import { UseProjectFilterParams, UseProjectFilterResult } from '@/features/projects/types';
import { useMemo, useState } from 'react';

export const useProjectFilter = ({ tasks }: UseProjectFilterParams): UseProjectFilterResult => {
  const [value, setValue] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    if (!value || value === 'all') {
      return tasks;
    }

    if (value === 'inbox') {
      return tasks?.filter((task) => !task.projectId);
    }

    return tasks?.filter((task) => {
      const taskProjectId = typeof task.projectId === 'object' ? task.projectId?.$id : task.projectId;
      return taskProjectId === value;
    });
  }, [value, tasks]);

  const filteredCount = filteredTasks?.length || 0;

  return {
    filteredTasks,
    filteredCount,
    value,
    setValue,
  };
};
