import { DashboardHeader } from '@/features/analytics/components/molecules/DashboardHeader/DashboardHeader';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('DashboardHeader', () => {
  describe('title display', () => {
    it('should display title when rendered', () => {
      render(
        <DashboardHeader
          title="Analytics Dashboard"
          description="View your stats"
        />
      );

      expect(screen.getByRole('heading', { name: 'Analytics Dashboard' })).toBeInTheDocument();
    });

    it('should display different title when provided', () => {
      render(
        <DashboardHeader
          title="Project Overview"
          description="Track progress"
        />
      );

      expect(screen.getByRole('heading', { name: 'Project Overview' })).toBeInTheDocument();
    });

    it('should display title with correct heading level', () => {
      render(
        <DashboardHeader
          title="Analytics Dashboard"
          description="View your stats"
        />
      );

      const heading = screen.getByRole('heading', { name: 'Analytics Dashboard' });
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('description display', () => {
    it('should display description when rendered', () => {
      render(
        <DashboardHeader
          title="Analytics Dashboard"
          description="View your stats"
        />
      );

      expect(screen.getByText('View your stats')).toBeInTheDocument();
    });

    it('should display different description when provided', () => {
      render(
        <DashboardHeader
          title="Analytics Dashboard"
          description="Track your performance metrics"
        />
      );

      expect(screen.getByText('Track your performance metrics')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render both title and description simultaneously when provided', () => {
      render(
        <DashboardHeader
          title="Analytics Dashboard"
          description="View your stats"
        />
      );

      expect(screen.getByRole('heading', { name: 'Analytics Dashboard' })).toBeInTheDocument();
      expect(screen.getByText('View your stats')).toBeInTheDocument();
    });
  });

  describe('snapshot', () => {
    it('should match snapshot when rendered with typical data', () => {
      const { container } = render(
        <DashboardHeader
          title="Analytics Dashboard"
          description="View your stats"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
