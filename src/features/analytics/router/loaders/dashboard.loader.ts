import { analyticsService } from '@/features/analytics/services/analytics.service';
import { TimeRange } from '@/features/analytics/types';
import { getUserId } from '@/shared/utils/auth/auth.utils';

export const dashboardLoader = async ({ request }: { request: Request }) => {
  try {
    const userId = getUserId();
    const url = new URL(request.url);
    const timeRange = (url.searchParams.get('range') as TimeRange) || '6m';

    const dashboardData = await analyticsService.getDashboardData(userId, timeRange);

    return { ...dashboardData, timeRange };
  } catch (error) {
    console.error('Dashboard loader error:', error);
    throw new Error('Failed to load dashboard data');
  }
};
