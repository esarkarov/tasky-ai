import { ActivityInfoFooter } from '@/features/analytics/components/atoms/ActivityInfoFooter/ActivityInfoFooter';
import { WEEKLY_ACTIVITY_CONFIG } from '@/features/analytics/constants';
import { ActivityData } from '@/features/analytics/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

interface WeeklyProductivityChartProps {
  data: ActivityData[];
  animationClass?: string;
}

export const WeeklyActivityChart = ({ data, animationClass = '' }: WeeklyProductivityChartProps) => {
  const totalTasks = data.reduce((sum, day) => sum + day.tasks, 0);
  const averageTasks = (totalTasks / data.length).toFixed(1);
  const mostProductiveDay = data.reduce((max, day) => (day.tasks > max.tasks ? day : max), data[0]);

  return (
    <Card className={animationClass}>
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Tasks completed per day</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={WEEKLY_ACTIVITY_CONFIG}
          className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={(value) => value}
            />
            <Line
              dataKey="tasks"
              type="natural"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                fill: 'hsl(var(--primary))',
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <ActivityInfoFooter
          bestDay={mostProductiveDay}
          averageTasks={averageTasks}
        />
      </CardFooter>
    </Card>
  );
};
