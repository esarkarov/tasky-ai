import { ActivityData } from '@/features/analytics/types';

interface ActivityInfoFooterProps {
  averageTasks: string;
  bestDay: ActivityData;
}

export const ActivityInfoFooter = ({ bestDay, averageTasks }: ActivityInfoFooterProps) => {
  return (
    <div className="flex w-full items-center gap-2 text-sm">
      <div className="grid flex-1 auto-rows-min gap-0.5">
        <div className="text-xs text-muted-foreground">Average</div>
        <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
          {averageTasks}
          <span className="text-sm font-normal text-muted-foreground">tasks/day</span>
        </div>
      </div>
      <div className="grid flex-1 auto-rows-min gap-0.5">
        <div className="text-xs text-muted-foreground">Best Day</div>
        <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
          {bestDay.tasks}
          <span className="text-sm font-normal text-muted-foreground">on {bestDay.day}</span>
        </div>
      </div>
    </div>
  );
};
