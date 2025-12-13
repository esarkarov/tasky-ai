import { InputValueCount } from '@/shared/components/atoms/InputValueCount/InputValueCount';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/constants', () => ({
  INPUT_WARN_THRESHOLD: 10,
}));

describe('InputValueCount', () => {
  interface RenderOptions {
    valueLength?: number;
    maxLength?: number;
    warnAtLength?: number;
  }

  const renderComponent = ({ valueLength = 5, maxLength = 100, warnAtLength }: RenderOptions = {}) => {
    return render(
      <InputValueCount
        valueLength={valueLength}
        maxLength={maxLength}
        warnAtLength={warnAtLength}
      />
    );
  };

  const getDisplay = (valueLength: number, maxLength: number) => screen.getByText(`${valueLength}/${maxLength}`);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render count with correct id and aria-live attribute', () => {
      renderComponent({ valueLength: 5, maxLength: 100 });

      const display = getDisplay(5, 100);
      expect(display).toBeInTheDocument();
      expect(display).toHaveAttribute('id', 'input-value-count');
      expect(display).toHaveAttribute('aria-live', 'polite');
    });

    it('should render different count values correctly', () => {
      renderComponent({ valueLength: 0, maxLength: 100 });
      expect(getDisplay(0, 100)).toBeInTheDocument();

      renderComponent({ valueLength: 100, maxLength: 100 });
      expect(getDisplay(100, 100)).toBeInTheDocument();

      renderComponent({ valueLength: 450, maxLength: 500 });
      expect(getDisplay(450, 500)).toBeInTheDocument();
    });
  });

  describe('warning styles', () => {
    it('should use normal style when below warning threshold', () => {
      renderComponent({ valueLength: 50, maxLength: 100 });

      const display = getDisplay(50, 100);
      expect(display).toHaveClass('text-muted-foreground');
      expect(display).not.toHaveClass('text-destructive');
    });

    it('should use warning style when at or above default threshold', () => {
      renderComponent({ valueLength: 90, maxLength: 100 });
      expect(getDisplay(90, 100)).toHaveClass('text-destructive');

      renderComponent({ valueLength: 95, maxLength: 100 });
      expect(getDisplay(95, 100)).toHaveClass('text-destructive');

      renderComponent({ valueLength: 100, maxLength: 100 });
      expect(getDisplay(100, 100)).toHaveClass('text-destructive');
    });

    it('should use warning style when at or above custom threshold', () => {
      renderComponent({ valueLength: 75, maxLength: 100, warnAtLength: 75 });
      expect(getDisplay(75, 100)).toHaveClass('text-destructive');

      renderComponent({ valueLength: 80, maxLength: 100, warnAtLength: 80 });
      expect(getDisplay(80, 100)).toHaveClass('text-destructive');
    });

    it('should not show warning when below custom threshold', () => {
      renderComponent({ valueLength: 74, maxLength: 100, warnAtLength: 75 });

      expect(getDisplay(74, 100)).not.toHaveClass('text-destructive');
    });

    it('should apply warning for small maxLength near limit', () => {
      renderComponent({ valueLength: 10, maxLength: 20 });

      expect(getDisplay(10, 20)).toHaveClass('text-destructive');
    });
  });

  describe('edge cases', () => {
    it('should handle minimal valueLength of 1', () => {
      renderComponent({ valueLength: 1, maxLength: 100 });

      expect(getDisplay(1, 100)).toBeInTheDocument();
    });

    it('should apply warning when warnAtLength is 0', () => {
      renderComponent({ valueLength: 0, maxLength: 100, warnAtLength: 0 });

      expect(getDisplay(0, 100)).toHaveClass('text-destructive');
    });
  });
});
