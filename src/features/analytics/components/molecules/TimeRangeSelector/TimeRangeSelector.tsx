import { TimeRangeButton } from '@/features/analytics/components/atoms/TimeRangeButton/TimeRangeButton';
import { TIME_RANGE_OPTIONS } from '@/features/analytics/constants';
import { TimeRange } from '@/features/analytics/types';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export const TimeRangeSelector = ({ selectedRange, onRangeChange }: TimeRangeSelectorProps) => {
  return (
    <div className="flex gap-2">
      {TIME_RANGE_OPTIONS.map((range) => (
        <TimeRangeButton
          key={range}
          range={range}
          isActive={selectedRange === range}
          onClick={onRangeChange}
        />
      ))}
    </div>
  );
};
