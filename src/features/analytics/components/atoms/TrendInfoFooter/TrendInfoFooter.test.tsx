import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendInfoFooter } from './TrendInfoFooter';

describe('TrendInfoFooter', () => {
  describe('positive trend display', () => {
    it('should display trending up message when trend is positive and isPositive is true', () => {
      render(
        <TrendInfoFooter
          trend={15}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText(/Trending up by 15% this month/i)).toBeInTheDocument();
    });

    it('should display trending up icon when trend is positive and isPositive is true', () => {
      const { container } = render(
        <TrendInfoFooter
          trend={15}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('negative trend display', () => {
    it('should display trending down message when trend is positive and isPositive is false', () => {
      render(
        <TrendInfoFooter
          trend={10}
          isPositive={false}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText(/Trending down by 10% this month/i)).toBeInTheDocument();
    });

    it('should display trending down icon when trend is positive and isPositive is false', () => {
      const { container } = render(
        <TrendInfoFooter
          trend={10}
          isPositive={false}
          dateRange="Jan 1 - Jan 31"
        />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('no change display', () => {
    it('should display no change message when trend is zero', () => {
      render(
        <TrendInfoFooter
          trend={0}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText('No change from last month')).toBeInTheDocument();
    });

    it('should not display trend icon when trend is zero', () => {
      const { container } = render(
        <TrendInfoFooter
          trend={0}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('should display no change message when trend is zero regardless of isPositive', () => {
      render(
        <TrendInfoFooter
          trend={0}
          isPositive={false}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText('No change from last month')).toBeInTheDocument();
    });
  });

  describe('date range display', () => {
    it('should display date range when provided', () => {
      render(
        <TrendInfoFooter
          trend={15}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText('Jan 1 - Jan 31')).toBeInTheDocument();
    });

    it('should display different date range when provided', () => {
      render(
        <TrendInfoFooter
          trend={15}
          isPositive={true}
          dateRange="Feb 1 - Feb 28"
        />
      );

      expect(screen.getByText('Feb 1 - Feb 28')).toBeInTheDocument();
    });

    it('should display date range even when trend is zero', () => {
      render(
        <TrendInfoFooter
          trend={0}
          isPositive={true}
          dateRange="Mar 1 - Mar 31"
        />
      );

      expect(screen.getByText('Mar 1 - Mar 31')).toBeInTheDocument();
    });
  });

  describe('different trend values', () => {
    it('should display large trend percentage when provided', () => {
      render(
        <TrendInfoFooter
          trend={95}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText(/Trending up by 95% this month/i)).toBeInTheDocument();
    });

    it('should display small trend percentage when provided', () => {
      render(
        <TrendInfoFooter
          trend={1}
          isPositive={false}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText(/Trending down by 1% this month/i)).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render both trend and date range simultaneously when trend is positive', () => {
      render(
        <TrendInfoFooter
          trend={15}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText(/Trending up by 15% this month/i)).toBeInTheDocument();
      expect(screen.getByText('Jan 1 - Jan 31')).toBeInTheDocument();
    });

    it('should render both no change message and date range when trend is zero', () => {
      render(
        <TrendInfoFooter
          trend={0}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(screen.getByText('No change from last month')).toBeInTheDocument();
      expect(screen.getByText('Jan 1 - Jan 31')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with positive trend', () => {
      const { container } = render(
        <TrendInfoFooter
          trend={15}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with negative trend', () => {
      const { container } = render(
        <TrendInfoFooter
          trend={10}
          isPositive={false}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when rendered with zero trend', () => {
      const { container } = render(
        <TrendInfoFooter
          trend={0}
          isPositive={true}
          dateRange="Jan 1 - Jan 31"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
