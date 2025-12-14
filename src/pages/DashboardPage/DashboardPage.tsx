'use client';

import { DashboardTemplate } from '@/features/analytics/components/templates/DashboardTemplate/DashboardTemplate';
import { useDashboard } from '@/features/analytics/hooks/useDashboard';

export const DashboardPage = () => {
  const {
    timeRange,
    statMetrics,
    taskCompletionData,
    taskDistributionData,
    projectProgressData,
    productivityData,
    performanceMetrics,
    handleTimeRangeChange,
  } = useDashboard();

  return (
    <DashboardTemplate
      title="Analytics Dashboard"
      description="Track your task productivity and project insights"
      selectedTimeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      statMetrics={statMetrics}
      taskCompletionData={taskCompletionData}
      taskDistributionData={taskDistributionData}
      projectProgressData={projectProgressData}
      productivityData={productivityData}
      performanceMetrics={performanceMetrics}
    />
  );
};
