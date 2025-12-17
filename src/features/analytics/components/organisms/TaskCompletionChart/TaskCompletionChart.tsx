import { TrendInfoFooter } from '@/features/analytics/components/atoms/TrendInfoFooter/TrendInfoFooter';
import { TASK_COMPLETION_CONFIG } from '@/features/analytics/constants';
import { useTrendInfo } from '@/features/analytics/hooks/use-trend-info';
import { TaskCompletionData } from '@/features/analytics/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

interface TaskCompletionChartProps {
  data: TaskCompletionData[];
  animationClass?: string;
}

export const TaskCompletionChart = ({ data, animationClass = '' }: TaskCompletionChartProps) => {
  const { isPositive, trend, dateRange } = useTrendInfo(data);

  return (
    <Card className={`lg:col-span-2 ${animationClass}`}>
      <CardHeader>
        <CardTitle>Task Completion Trends</CardTitle>
        <CardDescription>Showing task status for the last 6 months</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={TASK_COMPLETION_CONFIG}
          className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="completed"
              type="natural"
              fill="var(--color-completed)"
              fillOpacity={0.4}
              stroke="var(--color-completed)"
              stackId="a"
            />
            <Area
              dataKey="pending"
              type="natural"
              fill="var(--color-pending)"
              fillOpacity={0.4}
              stroke="var(--color-pending)"
              stackId="a"
            />
            <Area
              dataKey="overdue"
              type="natural"
              fill="var(--color-overdue)"
              fillOpacity={0.4}
              stroke="var(--color-overdue)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <TrendInfoFooter
          isPositive={isPositive}
          trend={trend}
          dateRange={dateRange}
        />
      </CardFooter>
    </Card>
  );
};
