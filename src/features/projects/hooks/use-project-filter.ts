import { UseProjectFilterParams, UseProjectFilterResult } from '@/features/projects/types';
import { useMemo, useState } from 'react';

export const useProjectFilter = ({ tasks }: UseProjectFilterParams): UseProjectFilterResult => {
  const [filterValue, setFilterValue] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    if (!filterValue || filterValue === 'all') {
      return tasks;
    }

    if (filterValue === 'inbox') {
      return tasks?.filter((task) => !task.projectId);
    }

    return tasks?.filter((task) => {
      const taskProjectId = typeof task.projectId === 'object' ? task.projectId?.$id : task.projectId;
      return taskProjectId === filterValue;
    });
  }, [filterValue, tasks]);
  const filteredCount = filteredTasks?.length || 0;

  return {
    filteredTasks,
    filteredCount,
    filterValue,
    setFilterValue,
  };
};
