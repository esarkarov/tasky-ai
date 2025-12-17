'use client';

import { DashboardTemplate } from '@/features/analytics/components/templates/DashboardTemplate/DashboardTemplate';
import { AnalyticsDashboardData, TimeRange } from '@/features/analytics/types';
import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';

interface DashboardLoaderData extends AnalyticsDashboardData {
  timeRange: TimeRange;
}

export const DashboardPage = () => {
  const loaderData = useLoaderData<DashboardLoaderData>();
  const [timeRange, setTimeRange] = useState<TimeRange>(loaderData.timeRange);
  const navigate = useNavigate();

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    navigate(`?range=${range}`, { replace: true });
  };

  return (
    <DashboardTemplate
      title="Analytics Dashboard"
      description="Track your task productivity and project insights"
      selectedTimeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      statMetrics={loaderData.statMetrics}
      taskCompletionData={loaderData.taskCompletionData}
      taskDistributionData={loaderData.taskDistributionData}
      projectProgressData={loaderData.projectProgressData}
      activityData={loaderData.activityData}
    />
  );
};
