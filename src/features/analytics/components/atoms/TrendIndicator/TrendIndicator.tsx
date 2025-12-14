import { TrendDirection } from '@/features/analytics/types';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface TrendIndicatorProps {
  trend: TrendDirection;
  change: string;
  className?: string;
}

export const TrendIndicator = ({ trend, change, className = '' }: TrendIndicatorProps) => {
  const isUpTrend = trend === 'up';
  const Icon = isUpTrend ? TrendingUp : TrendingDown;
  const colorClass = isUpTrend ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <span className={`${colorClass} font-semibold`}>{change}</span>
      <span className="text-muted-foreground">vs last month</span>
    </div>
  );
};
