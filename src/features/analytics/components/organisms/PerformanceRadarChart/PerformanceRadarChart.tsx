import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { ChartFooterText } from '@/features/analytics/components/atoms/ChartFooterText/ChartFooterText';
import { PERFORMANCE_CONFIG } from '@/features/analytics/constants';
import { PerformanceMetric } from '@/features/analytics/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';

interface PerformanceRadarChartProps {
  data: PerformanceMetric[];
  animationClass?: string;
}

export const PerformanceRadarChart = ({ data, animationClass = '' }: PerformanceRadarChartProps) => {
  const averageScore = (data.reduce((sum, item) => sum + item.score, 0) / data.length).toFixed(1);

  return (
    <Card className={animationClass}>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Multi-dimensional analysis</CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer
          config={PERFORMANCE_CONFIG}
          className="mx-auto aspect-square max-h-[300px]">
          <RadarChart data={data}>
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <PolarAngleAxis dataKey="metric" />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <ChartFooterText text={`Overall score: ${averageScore}/100`} />
      </CardFooter>
    </Card>
  );
};
