import { ChartCenterLabel } from '@/features/analytics/components/atoms/ChartCenterLabel/ChartCenterLabel';
import { TaskDistribution } from '@/features/analytics/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
import { useMemo } from 'react';
import { Label, Pie, PieChart } from 'recharts';

interface TaskDistributionChartProps {
  data: TaskDistribution[];
  animationClass?: string;
}

export const TaskDistributionChart = ({ data, animationClass = '' }: TaskDistributionChartProps) => {
  const totalTasks = data.reduce((sum, item) => sum + item.tasks, 0);
  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {
      tasks: {
        label: 'Tasks',
      },
    };
    data.forEach((item) => {
      config[item.category] = {
        label: item.label,
        color: item.fill,
      };
    });

    return config;
  }, [data]);

  return (
    <Card className={`flex flex-col ${animationClass}`}>
      <CardHeader className="pb-0">
        <CardTitle>Task Distribution</CardTitle>
        <CardDescription>By top 5 project</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
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
                      <ChartCenterLabel
                        viewBox={viewBox}
                        totalTasks={totalTasks}
                      />
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">Showing task breakdown by top 5 project</div>
      </CardFooter>
    </Card>
  );
};
