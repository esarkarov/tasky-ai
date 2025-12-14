import { StatCard } from '@/features/analytics/components/molecules/StatCard/StatCard';
import { StatMetric } from '@/features/analytics/types';

interface StatsGridProps {
  metrics: StatMetric[];
}

export const StatsGrid = ({ metrics }: StatsGridProps) => {
  const animationClasses = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {metrics.map((metric, index) => (
        <StatCard
          key={metric.title}
          metric={metric}
          animationClass={`animate-slide-in ${animationClasses[index] || ''}`}
        />
      ))}
    </div>
  );
};
