import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { ChartFooterText } from '@/features/analytics/components/atoms/ChartFooterText/ChartFooterText';
import { PRODUCTIVITY_CONFIG } from '@/features/analytics/constants';
import { ProductivityData } from '@/features/analytics/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';

interface WeeklyProductivityChartProps {
  data: ProductivityData[];
  animationClass?: string;
}

export const WeeklyProductivityChart = ({ data, animationClass = '' }: WeeklyProductivityChartProps) => {
  const averageHours = (data.reduce((sum, day) => sum + day.hours, 0) / data.length).toFixed(1);

  return (
    <Card className={animationClass}>
      <CardHeader>
        <CardTitle>Weekly Productivity</CardTitle>
        <CardDescription>Hours worked per day</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={PRODUCTIVITY_CONFIG}
          className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="hours"
              type="natural"
              stroke="var(--color-hours)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-hours)',
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <ChartFooterText text={`Average: ${averageHours} hours per day`} />
      </CardFooter>
    </Card>
  );
};
