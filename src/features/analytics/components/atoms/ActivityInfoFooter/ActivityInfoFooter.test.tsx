import { ActivityInfoFooter } from '@/features/analytics/components/atoms/ActivityInfoFooter/ActivityInfoFooter';
import { ActivityData } from '@/features/analytics/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('ActivityInfoFooter', () => {
  const mockBestDay: ActivityData = {
    day: 'Monday',
    tasks: 15,
  };

  describe('average tasks section', () => {
    it('should display average tasks value when rendered', () => {
      render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText('8.5')).toBeInTheDocument();
    });

    it('should display average tasks label when rendered', () => {
      render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText('Average')).toBeInTheDocument();
    });

    it('should display tasks per day unit when rendered', () => {
      render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText('tasks/day')).toBeInTheDocument();
    });

    it('should display zero average tasks when provided', () => {
      render(
        <ActivityInfoFooter
          averageTasks="0"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display decimal average tasks when provided', () => {
      render(
        <ActivityInfoFooter
          averageTasks="12.75"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText('12.75')).toBeInTheDocument();
    });
  });

  describe('best day section', () => {
    it('should display best day tasks value when rendered', () => {
      render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should display best day label when rendered', () => {
      render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText('Best Day')).toBeInTheDocument();
    });

    it('should display best day name when rendered', () => {
      render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText(/on Monday/i)).toBeInTheDocument();
    });

    it('should display different best day when provided', () => {
      const differentBestDay: ActivityData = {
        day: 'Friday',
        tasks: 20,
      };

      render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={differentBestDay}
        />
      );

      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText(/on Friday/i)).toBeInTheDocument();
    });

    it('should display zero tasks for best day when provided', () => {
      const zeroBestDay: ActivityData = {
        day: 'Sunday',
        tasks: 0,
      };

      render(
        <ActivityInfoFooter
          averageTasks="0"
          bestDay={zeroBestDay}
        />
      );

      const bestDaySection = screen.getByText('Best Day').closest('div.grid');
      expect(bestDaySection).toHaveTextContent('0');
      expect(bestDaySection).toHaveTextContent('on Sunday');
    });
  });

  describe('component structure', () => {
    it('should render both sections simultaneously when provided with data', () => {
      render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={mockBestDay}
        />
      );

      expect(screen.getByText('Average')).toBeInTheDocument();
      expect(screen.getByText('Best Day')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with typical data', () => {
      const { container } = render(
        <ActivityInfoFooter
          averageTasks="8.5"
          bestDay={mockBestDay}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
