import { PolarViewBox } from 'recharts/types/util/types';

interface ChartCenterLabelProps {
  viewBox: PolarViewBox;
  totalTasks: number;
}

export const ChartCenterLabel = ({ viewBox, totalTasks }: ChartCenterLabelProps) => {
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
};
