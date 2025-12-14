import { ChartFooterText } from '@/features/analytics/components/atoms/ChartFooterText/ChartFooterText';
import { TASK_DISTRIBUTION_CONFIG } from '@/features/analytics/constants';
import { TaskDistribution } from '@/features/analytics/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';

interface TaskDistributionChartProps {
  data: TaskDistribution[];
  animationClass?: string;
}

export const TaskDistributionChart = ({ data, animationClass = '' }: TaskDistributionChartProps) => {
  const totalTasks = data.reduce((sum, item) => sum + item.tasks, 0);

  return (
    <Card className={`flex flex-col ${animationClass}`}>
      <CardHeader className="pb-0">
        <CardTitle>Task Distribution</CardTitle>
        <CardDescription>By category</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={TASK_DISTRIBUTION_CONFIG}
          className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="tasks"
                  hideLabel
                />
              }
            />
            <Pie
              data={data}
              dataKey="tasks"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold">
                          {totalTasks}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground">
                          Total Tasks
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <ChartFooterText text="Showing task breakdown by category" />
      </CardFooter>
    </Card>
  );
};
