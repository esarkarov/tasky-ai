import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { TASK_COMPLETION_CONFIG } from '@/features/analytics/constants';
import { TaskCompletionData } from '@/features/analytics/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';

interface TaskCompletionChartProps {
  data: TaskCompletionData[];
  animationClass?: string;
}

export const TaskCompletionChart = ({ data, animationClass = '' }: TaskCompletionChartProps) => {
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
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
