import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputValueCount, InputValueCountProps } from './InputValueCount';

vi.mock('@/constants/validation', () => ({
  INPUT_WARN_THRESHOLD: 10,
}));

describe('InputValueCount', () => {
  const setup = (props?: Partial<InputValueCountProps>) => {
    const defaultProps = {
      valueLength: 5,
      maxLength: 100,
      ...props,
    };
    render(<InputValueCount {...defaultProps} />);
    const display = screen.getByText(`${defaultProps.valueLength}/${defaultProps.maxLength}`);
    return { display };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders count correctly', () => {
      const { display } = setup({ valueLength: 5, maxLength: 100 });
      expect(display).toBeInTheDocument();
      expect(display).toHaveTextContent('5/100');
    });

    it('renders with correct id', () => {
      const { display } = setup();
      expect(display).toHaveAttribute('id', 'input-value-count');
    });

    it('renders zero value', () => {
      const { display } = setup({ valueLength: 0 });
      expect(display).toHaveTextContent('0/100');
    });

    it('renders full count', () => {
      const { display } = setup({ valueLength: 100 });
      expect(display).toHaveTextContent('100/100');
    });
  });

  describe('styling', () => {
    it('uses normal style when below threshold', () => {
      const { display } = setup({ valueLength: 50 });
      expect(display).toHaveClass('text-muted-foreground');
      expect(display).not.toHaveClass('text-destructive');
    });

    it('uses warning style when near max', () => {
      const { display } = setup({ valueLength: 90 });
      expect(display).toHaveClass('text-destructive');
    });

    it('uses warning style when above threshold', () => {
      const { display } = setup({ valueLength: 95 });
      expect(display).toHaveClass('text-destructive');
    });

    it('uses warning style at max length', () => {
      const { display } = setup({ valueLength: 100 });
      expect(display).toHaveClass('text-destructive');
    });
  });

  describe('custom threshold', () => {
    it('uses custom warnAtLength', () => {
      const { display } = setup({ valueLength: 75, warnAtLength: 75 });
      expect(display).toHaveClass('text-destructive');
    });

    it('no warning before custom threshold', () => {
      const { display } = setup({ valueLength: 74, warnAtLength: 75 });
      expect(display).not.toHaveClass('text-destructive');
    });

    it('applies warning at custom threshold', () => {
      const { display } = setup({ valueLength: 80, warnAtLength: 80 });
      expect(display).toHaveClass('text-destructive');
    });
  });

  describe('different max lengths', () => {
    it('renders small maxLength', () => {
      const { display } = setup({ valueLength: 15, maxLength: 20 });
      expect(display).toHaveTextContent('15/20');
    });

    it('renders large maxLength', () => {
      const { display } = setup({ valueLength: 450, maxLength: 500 });
      expect(display).toHaveTextContent('450/500');
    });

    it('uses warning for small limits', () => {
      const { display } = setup({ valueLength: 10, maxLength: 20 });
      expect(display).toHaveClass('text-destructive');
    });
  });

  describe('accessibility', () => {
    it('has aria-live="polite"', () => {
      const { display } = setup();
      expect(display).toHaveAttribute('aria-live', 'polite');
    });

    it('keeps aria-live after rerender', () => {
      const { display } = setup({ valueLength: 5 });
      expect(display).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('edge cases', () => {
    it('handles equal valueLength and maxLength', () => {
      const { display } = setup({ valueLength: 100 });
      expect(display).toHaveTextContent('100/100');
    });

    it('handles minimal valueLength of 1', () => {
      const { display } = setup({ valueLength: 1 });
      expect(display).toHaveTextContent('1/100');
    });

    it('applies warning when warnAtLength = 0', () => {
      const { display } = setup({ valueLength: 0, warnAtLength: 0 });
      expect(display).toHaveClass('text-destructive');
    });
  });
});
