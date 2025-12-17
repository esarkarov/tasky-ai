import { TimeRangeSelector } from '@/features/analytics/components/molecules/TimeRangeSelector/TimeRangeSelector';
import { TimeRange } from '@/features/analytics/types';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/analytics/constants', () => ({
  TIME_RANGE_OPTIONS: ['7d', '30d', '6m'] as TimeRange[],
}));

vi.mock('@/features/analytics/components/atoms/TimeRangeButton/TimeRangeButton', () => ({
  TimeRangeButton: ({
    range,
    isActive,
    onClick,
  }: {
    range: TimeRange;
    isActive: boolean;
    onClick: (range: TimeRange) => void;
  }) => (
    <button
      onClick={() => onClick(range)}
      data-testid={`time-range-${range}`}
      aria-pressed={isActive}>
      {range}
    </button>
  ),
}));

describe('TimeRangeSelector', () => {
  const mockOnRangeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('button rendering', () => {
    it('should render all time range buttons when rendered', () => {
      render(
        <TimeRangeSelector
          selectedRange="7d"
          onRangeChange={mockOnRangeChange}
        />
      );

      expect(screen.getByRole('button', { name: '7d' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '30d' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6m' })).toBeInTheDocument();
    });
  });

  describe('active state management', () => {
    it('should mark selected range as active when rendered', () => {
      render(
        <TimeRangeSelector
          selectedRange="7d"
          onRangeChange={mockOnRangeChange}
        />
      );

      const button7d = screen.getByRole('button', { name: '7d' });
      expect(button7d).toHaveAttribute('aria-pressed', 'true');
    });

    it('should mark only selected range as active when different range is selected', () => {
      render(
        <TimeRangeSelector
          selectedRange="30d"
          onRangeChange={mockOnRangeChange}
        />
      );

      const button7d = screen.getByRole('button', { name: '7d' });
      const button30d = screen.getByRole('button', { name: '30d' });
      const button6m = screen.getByRole('button', { name: '6m' });

      expect(button7d).toHaveAttribute('aria-pressed', 'false');
      expect(button30d).toHaveAttribute('aria-pressed', 'true');
      expect(button6m).toHaveAttribute('aria-pressed', 'false');
    });

    it('should mark last range as active when selected', () => {
      render(
        <TimeRangeSelector
          selectedRange="6m"
          onRangeChange={mockOnRangeChange}
        />
      );

      const button6m = screen.getByRole('button', { name: '6m' });
      expect(button6m).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('range change interaction', () => {
    it('should call onRangeChange with selected range when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TimeRangeSelector
          selectedRange="7d"
          onRangeChange={mockOnRangeChange}
        />
      );

      const button30d = screen.getByRole('button', { name: '30d' });
      await user.click(button30d);

      expect(mockOnRangeChange).toHaveBeenCalledTimes(1);
      expect(mockOnRangeChange).toHaveBeenCalledWith('30d');
    });

    it('should call onRangeChange with correct range when different button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TimeRangeSelector
          selectedRange="7d"
          onRangeChange={mockOnRangeChange}
        />
      );

      const button6m = screen.getByRole('button', { name: '6m' });
      await user.click(button6m);

      expect(mockOnRangeChange).toHaveBeenCalledTimes(1);
      expect(mockOnRangeChange).toHaveBeenCalledWith('6m');
    });

    it('should call onRangeChange when currently active button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TimeRangeSelector
          selectedRange="7d"
          onRangeChange={mockOnRangeChange}
        />
      );

      const button7d = screen.getByRole('button', { name: '7d' });
      await user.click(button7d);

      expect(mockOnRangeChange).toHaveBeenCalledTimes(1);
      expect(mockOnRangeChange).toHaveBeenCalledWith('7d');
    });

    it('should handle multiple button clicks independently', async () => {
      const user = userEvent.setup();
      render(
        <TimeRangeSelector
          selectedRange="7d"
          onRangeChange={mockOnRangeChange}
        />
      );

      const button7d = screen.getByRole('button', { name: '7d' });
      const button30d = screen.getByRole('button', { name: '30d' });

      await user.click(button30d);
      await user.click(button7d);
      await user.click(button30d);

      expect(mockOnRangeChange).toHaveBeenCalledTimes(3);
      expect(mockOnRangeChange).toHaveBeenNthCalledWith(1, '30d');
      expect(mockOnRangeChange).toHaveBeenNthCalledWith(2, '7d');
      expect(mockOnRangeChange).toHaveBeenNthCalledWith(3, '30d');
    });
  });
});
