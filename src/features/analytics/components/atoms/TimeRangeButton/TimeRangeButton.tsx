import { TimeRange } from '@/features/analytics/types';

interface TimeRangeButtonProps {
  range: TimeRange;
  isActive: boolean;
  onClick: (range: TimeRange) => void;
}

export const TimeRangeButton = ({ range, isActive, onClick }: TimeRangeButtonProps) => {
  return (
    <button
      onClick={() => onClick(range)}
      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}>
      {range}
    </button>
  );
};
