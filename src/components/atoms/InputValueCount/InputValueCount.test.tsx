import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputValueCount } from './InputValueCount';

vi.mock('@/constants/validation', () => ({
  INPUT_WARN_THRESHOLD: 10,
}));

describe('InputValueCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render count display', () => {
      render(
        <InputValueCount
          valueLength={5}
          maxLength={100}
        />
      );

      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('should have correct id', () => {
      render(
        <InputValueCount
          valueLength={5}
          maxLength={100}
        />
      );

      const countElement = screen.getByText('5/100');
      expect(countElement).toHaveAttribute('id', 'input-value-count');
    });

    it('should display zero count', () => {
      render(
        <InputValueCount
          valueLength={0}
          maxLength={100}
        />
      );

      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    it('should display max length count', () => {
      render(
        <InputValueCount
          valueLength={100}
          maxLength={100}
        />
      );

      expect(screen.getByText('100/100')).toBeInTheDocument();
    });
  });

  describe('warning state', () => {
    it('should show normal styling when below warning threshold', () => {
      render(
        <InputValueCount
          valueLength={50}
          maxLength={100}
        />
      );

      const countElement = screen.getByText('50/100');
      expect(countElement).toHaveClass('text-muted-foreground');
      expect(countElement).not.toHaveClass('text-destructive');
    });

    it('should show warning styling when at default warning threshold', () => {
      render(
        <InputValueCount
          valueLength={90}
          maxLength={100}
        />
      );

      const countElement = screen.getByText('90/100');
      expect(countElement).toHaveClass('text-destructive');
    });

    it('should show warning styling when above default warning threshold', () => {
      render(
        <InputValueCount
          valueLength={95}
          maxLength={100}
        />
      );

      const countElement = screen.getByText('95/100');
      expect(countElement).toHaveClass('text-destructive');
    });

    it('should show warning styling when at max length', () => {
      render(
        <InputValueCount
          valueLength={100}
          maxLength={100}
        />
      );

      const countElement = screen.getByText('100/100');
      expect(countElement).toHaveClass('text-destructive');
    });
  });

  describe('custom warning threshold', () => {
    it('should use custom warnAtLength when provided', () => {
      render(
        <InputValueCount
          valueLength={75}
          maxLength={100}
          warnAtLength={75}
        />
      );

      const countElement = screen.getByText('75/100');
      expect(countElement).toHaveClass('text-destructive');
    });

    it('should not show warning before custom threshold', () => {
      render(
        <InputValueCount
          valueLength={74}
          maxLength={100}
          warnAtLength={75}
        />
      );

      const countElement = screen.getByText('74/100');
      expect(countElement).not.toHaveClass('text-destructive');
    });

    it('should show warning at custom threshold', () => {
      render(
        <InputValueCount
          valueLength={80}
          maxLength={100}
          warnAtLength={80}
        />
      );

      const countElement = screen.getByText('80/100');
      expect(countElement).toHaveClass('text-destructive');
    });
  });

  describe('different max lengths', () => {
    it('should handle small max length', () => {
      render(
        <InputValueCount
          valueLength={15}
          maxLength={20}
        />
      );

      expect(screen.getByText('15/20')).toBeInTheDocument();
    });

    it('should handle large max length', () => {
      render(
        <InputValueCount
          valueLength={450}
          maxLength={500}
        />
      );

      expect(screen.getByText('450/500')).toBeInTheDocument();
    });

    it('should calculate default warning threshold correctly for small limits', () => {
      render(
        <InputValueCount
          valueLength={10}
          maxLength={20}
        />
      );

      const countElement = screen.getByText('10/20');
      expect(countElement).toHaveClass('text-destructive');
    });
  });

  describe('accessibility', () => {
    it('should have aria-live attribute', () => {
      render(
        <InputValueCount
          valueLength={5}
          maxLength={100}
        />
      );

      const countElement = screen.getByText('5/100');
      expect(countElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce changes to screen readers', () => {
      const { rerender } = render(
        <InputValueCount
          valueLength={5}
          maxLength={100}
        />
      );

      expect(screen.getByText('5/100')).toHaveAttribute('aria-live', 'polite');

      rerender(
        <InputValueCount
          valueLength={95}
          maxLength={100}
        />
      );

      expect(screen.getByText('95/100')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('edge cases', () => {
    it('should handle valueLength equal to maxLength', () => {
      render(
        <InputValueCount
          valueLength={100}
          maxLength={100}
        />
      );

      expect(screen.getByText('100/100')).toBeInTheDocument();
    });

    it('should handle valueLength of 1', () => {
      render(
        <InputValueCount
          valueLength={1}
          maxLength={100}
        />
      );

      expect(screen.getByText('1/100')).toBeInTheDocument();
    });

    it('should handle warnAtLength of 0', () => {
      render(
        <InputValueCount
          valueLength={0}
          maxLength={100}
          warnAtLength={0}
        />
      );

      const countElement = screen.getByText('0/100');
      expect(countElement).toHaveClass('text-destructive');
    });
  });
});
