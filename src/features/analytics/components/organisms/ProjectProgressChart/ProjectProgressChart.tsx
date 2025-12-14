import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { PROJECT_PROGRESS_CONFIG } from '@/features/analytics/constants';
import { ProjectProgress } from '@/features/analytics/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';

interface ProjectProgressChartProps {
  data: ProjectProgress[];
  animationClass?: string;
}

export const ProjectProgressChart = ({ data, animationClass = '' }: ProjectProgressChartProps) => {
  return (
    <Card className={animationClass}>
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <CardDescription>Completion percentage by project</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={PROJECT_PROGRESS_CONFIG}
          className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}>
            <YAxis
              dataKey="project"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 12)}
              hide
            />
            <XAxis
              dataKey="progress"
              type="number"
              hide
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Bar
              dataKey="progress"
              layout="vertical"
              radius={4}>
              <LabelList
                dataKey="project"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="progress"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
