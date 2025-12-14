import {
  MOCK_PERFORMANCE_METRICS,
  MOCK_PRODUCTIVITY_DATA,
  MOCK_PROJECT_PROGRESS_DATA,
  MOCK_STAT_METRICS,
  MOCK_TASK_COMPLETION_DATA,
  MOCK_TASK_DISTRIBUTION_DATA,
} from '@/features/analytics/constants';
import { TimeRange } from '@/features/analytics/types';
import { useState } from 'react';

export const useDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');

  const statMetrics = MOCK_STAT_METRICS;
  const taskCompletionData = MOCK_TASK_COMPLETION_DATA;
  const taskDistributionData = MOCK_TASK_DISTRIBUTION_DATA;
  const projectProgressData = MOCK_PROJECT_PROGRESS_DATA;
  const productivityData = MOCK_PRODUCTIVITY_DATA;
  const performanceMetrics = MOCK_PERFORMANCE_METRICS;

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    // TODO: Fetch data based on the new time range
  };

  return {
    timeRange,
    statMetrics,
    taskCompletionData,
    taskDistributionData,
    projectProgressData,
    productivityData,
    performanceMetrics,
    handleTimeRangeChange,
  };
};
