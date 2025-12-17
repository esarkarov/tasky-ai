import {
  MAX_DISPLAY_ITEMS,
  MAX_PROJECT_NAME_LENGTH,
  TIME_RANGE_LABELS,
  TRUNCATE_PROJECT_NAME_AT,
  WEEKDAYS,
} from '@/features/analytics/constants';
import { analyticsRepository } from '@/features/analytics/repositories/analytics.repository';
import type {
  ActivityData,
  AnalyticsDashboardData,
  ProjectProgress,
  StatMetric,
  TaskCompletionData,
  TaskDistribution,
  TimeRange,
} from '@/features/analytics/types';
import {
  createCategoryKey,
  getChartColor,
  getDayName,
  getLast6Months,
  getMonthName,
  getTaskStatus,
  truncateText,
} from '@/features/analytics/utils/analytics.utils';
import { Project } from '@/features/projects/types';
import { Task } from '@/features/tasks/types';

export const analyticsService = {
  transformTaskCompletionData(tasks: Task[]): TaskCompletionData[] {
    const months = getLast6Months();

    const monthlyData = new Map(months.map((month) => [month, { completed: 0, pending: 0, overdue: 0 }]));

    tasks.forEach((task) => {
      const month = getMonthName(task.$createdAt);
      const status = getTaskStatus(task);
      const data = monthlyData.get(month);

      if (data) {
        data[status]++;
      }
    });

    return months.map((month) => ({
      month,
      ...monthlyData.get(month)!,
    }));
  },
  transformTaskDistributionData(tasks: Task[], projects: Project[]): TaskDistribution[] {
    const projectTaskCount = tasks.reduce((acc, task) => {
      if (task.projectId) {
        const projectId = task.projectId.$id;
        acc.set(projectId, (acc.get(projectId) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>());

    const topProjects = projects
      .map((project) => ({
        project,
        count: projectTaskCount.get(project.$id) || 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_DISPLAY_ITEMS);

    return topProjects.map((item, index) => ({
      category: createCategoryKey(item.project.name),
      label: item.project.name,
      tasks: item.count,
      fill: getChartColor(index, item.project.color_hex),
    }));
  },
  transformProjectProgressData(projects: Project[]): ProjectProgress[] {
    const projectsWithTasks = projects.filter((project) => project.tasks && project.tasks.length > 0);

    return projectsWithTasks.slice(0, MAX_DISPLAY_ITEMS).map((project, index) => {
      const tasks = project.tasks || [];
      const completedCount = tasks.filter((task) => task.completed).length;
      const totalCount = tasks.length;
      const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        project: truncateText(project.name, MAX_PROJECT_NAME_LENGTH, TRUNCATE_PROJECT_NAME_AT),
        progress: progressPercentage,
        fill: getChartColor(index, project.color_hex),
      };
    });
  },
  calculateActivityData(tasks: Task[]): ActivityData[] {
    const dailyCompletion = new Map(WEEKDAYS.map((day) => [day, 0]));

    tasks
      .filter((task) => task.completed && task.$updatedAt)
      .forEach((task) => {
        const dayName = getDayName(task.$updatedAt);
        dailyCompletion.set(dayName, (dailyCompletion.get(dayName) || 0) + 1);
      });

    return WEEKDAYS.map((day) => ({
      day,
      tasks: dailyCompletion.get(day) || 0,
    }));
  },
  calculateStatMetrics(
    totalTasks: number,
    completedTasks: number,
    pendingTasks: number,
    overdueTasks: number,
    timeRange: TimeRange
  ): StatMetric[] {
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const inProgressTasks = pendingTasks - overdueTasks;

    return [
      {
        title: 'Total Tasks',
        value: totalTasks.toString(),
        change: `Created ${TIME_RANGE_LABELS[timeRange]}`,
        icon: 'ListTodo',
      },
      {
        title: 'Completed',
        value: completedTasks.toString(),
        change: `${completionRate}% of all tasks`,
        icon: 'CheckCircle2',
      },
      {
        title: 'In Progress',
        value: inProgressTasks.toString(),
        change: overdueTasks > 0 ? `${overdueTasks} overdue` : 'All on schedule',
        icon: 'Clock',
      },
      {
        title: 'Overdue',
        value: overdueTasks.toString(),
        change: overdueTasks > 0 ? 'Need attention' : 'Great work!',
        icon: 'AlertCircle',
      },
    ];
  },
  async getDashboardData(userId: string, timeRange: TimeRange): Promise<AnalyticsDashboardData> {
    try {
      const [tasks, projectsWithTasks, totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
        analyticsRepository.getTasks(userId, timeRange),
        analyticsRepository.getProjectsWithTasks(userId),
        analyticsRepository.countTasks(userId),
        analyticsRepository.countCompletedTasks(userId),
        analyticsRepository.countPendingTasks(userId),
        analyticsRepository.countOverdueTasks(userId),
      ]);

      return {
        statMetrics: this.calculateStatMetrics(totalTasks, completedTasks, pendingTasks, overdueTasks, timeRange),
        taskCompletionData: this.transformTaskCompletionData(tasks),
        taskDistributionData: this.transformTaskDistributionData(tasks, projectsWithTasks),
        projectProgressData: this.transformProjectProgressData(projectsWithTasks),
        activityData: this.calculateActivityData(tasks),
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw new Error('Failed to load analytics data');
    }
  },
};
