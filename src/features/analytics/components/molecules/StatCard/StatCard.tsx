import { TrendIndicator } from '@/features/analytics/components/atoms/TrendIndicator/TrendIndicator';
import { StatMetric } from '@/features/analytics/types';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface StatCardProps {
  metric: StatMetric;
  animationClass?: string;
}

export const StatCard = ({ metric, animationClass = '' }: StatCardProps) => {
  const { title, value, change, trend, icon } = metric;

  return (
    <div className={animationClass}>
      <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-border transition-all duration-300 hover:shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

        <CardHeader className="relative flex flex-row items-start justify-between pb-2">
          <div className="space-y-1 flex-1">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">{title}</CardDescription>
            <CardTitle className="text-3xl font-bold tracking-tight">{value}</CardTitle>
          </div>
          <div className="text-4xl opacity-30 group-hover:opacity-40 transition-opacity duration-300">{icon}</div>
        </CardHeader>

        <CardFooter className="relative pt-0">
          <TrendIndicator
            trend={trend}
            change={change}
          />
        </CardFooter>
      </Card>
    </div>
  );
};
