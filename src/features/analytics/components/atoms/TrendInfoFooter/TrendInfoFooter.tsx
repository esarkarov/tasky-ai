import { TrendingDown, TrendingUp } from 'lucide-react';

interface TrendInfoFooterProps {
  trend: number;
  isPositive: boolean;
  dateRange: string;
}

export const TrendInfoFooter = ({ isPositive, trend, dateRange }: TrendInfoFooterProps) => {
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex w-full items-start gap-2 text-sm">
      <div className="grid gap-2">
        <div className="flex items-center gap-2 font-medium leading-none">
          {trend > 0 ? (
            <>
              Trending {isPositive ? 'up' : 'down'} by {trend}% this month
              <TrendIcon className="h-4 w-4" />
            </>
          ) : (
            <>No change from last month</>
          )}
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">{dateRange}</div>
      </div>
    </div>
  );
};
