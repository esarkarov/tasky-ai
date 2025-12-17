import { ChartCenterLabel } from '@/features/analytics/components/atoms/ChartCenterLabel/ChartCenterLabel';
import { render, screen } from '@testing-library/react';
import { PolarViewBox } from 'recharts/types/util/types';
import { describe, expect, it } from 'vitest';

describe('ChartCenterLabel', () => {
  const mockViewBox: PolarViewBox = {
    cx: 200,
    cy: 150,
  };

  describe('total tasks display', () => {
    it('should display total tasks number when rendered', () => {
      render(
        <svg>
          <ChartCenterLabel
            viewBox={mockViewBox}
            totalTasks={42}
          />
        </svg>
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display zero total tasks when provided', () => {
      render(
        <svg>
          <ChartCenterLabel
            viewBox={mockViewBox}
            totalTasks={0}
          />
        </svg>
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display large total tasks number when provided', () => {
      render(
        <svg>
          <ChartCenterLabel
            viewBox={mockViewBox}
            totalTasks={9999}
          />
        </svg>
      );

      expect(screen.getByText('9999')).toBeInTheDocument();
    });
  });

  describe('label text', () => {
    it('should display "Total Tasks" label when rendered', () => {
      render(
        <svg>
          <ChartCenterLabel
            viewBox={mockViewBox}
            totalTasks={42}
          />
        </svg>
      );

      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });
  });

  describe('viewBox positioning', () => {
    it('should render with different viewBox coordinates when provided', () => {
      const differentViewBox: PolarViewBox = {
        cx: 300,
        cy: 250,
      };

      const { container } = render(
        <svg>
          <ChartCenterLabel
            viewBox={differentViewBox}
            totalTasks={100}
          />
        </svg>
      );

      const textElement = container.querySelector('text');
      expect(textElement).toHaveAttribute('x', '300');
      expect(textElement).toHaveAttribute('y', '250');
    });

    it('should handle viewBox with cy as zero when provided', () => {
      const viewBoxWithZeroCy: PolarViewBox = {
        cx: 200,
        cy: 0,
      };

      const { container } = render(
        <svg>
          <ChartCenterLabel
            viewBox={viewBoxWithZeroCy}
            totalTasks={50}
          />
        </svg>
      );

      const textElement = container.querySelector('text');
      expect(textElement).toHaveAttribute('y', '0');
    });
  });

  describe('component structure', () => {
    it('should render both number and label simultaneously when provided with data', () => {
      render(
        <svg>
          <ChartCenterLabel
            viewBox={mockViewBox}
            totalTasks={42}
          />
        </svg>
      );

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with typical data', () => {
      const { container } = render(
        <svg>
          <ChartCenterLabel
            viewBox={mockViewBox}
            totalTasks={42}
          />
        </svg>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
