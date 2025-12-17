import { TimeRangeButton } from '@/features/analytics/components/atoms/TimeRangeButton/TimeRangeButton';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('TimeRangeButton', () => {
  const mockOnClick = vi.fn();

  describe('button rendering', () => {
    it('should display range text when rendered', () => {
      render(
        <TimeRangeButton
          range="7d"
          isActive={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button', { name: '7d' })).toBeInTheDocument();
    });

    it('should display different range text when provided', () => {
      render(
        <TimeRangeButton
          range="30d"
          isActive={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button', { name: '30d' })).toBeInTheDocument();
    });
  });

  describe('active state styling', () => {
    it('should apply active styles when isActive is true', () => {
      render(
        <TimeRangeButton
          range="7d"
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button', { name: '7d' });
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
    });

    it('should apply inactive styles when isActive is false', () => {
      render(
        <TimeRangeButton
          range="7d"
          isActive={false}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button', { name: '7d' });
      expect(button).toHaveClass('bg-secondary');
      expect(button).toHaveClass('text-secondary-foreground');
    });
  });

  describe('click interaction', () => {
    it('should call onClick with range when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TimeRangeButton
          range="30d"
          isActive={false}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button', { name: '30d' });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('30d');
    });

    it('should call onClick with correct range when different range is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClick2 = vi.fn();
      render(
        <TimeRangeButton
          range="6m"
          isActive={false}
          onClick={mockOnClick2}
        />
      );

      const button = screen.getByRole('button', { name: '6m' });
      await user.click(button);

      expect(mockOnClick2).toHaveBeenCalledTimes(1);
      expect(mockOnClick2).toHaveBeenCalledWith('6m');
    });

    it('should call onClick when active button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClick3 = vi.fn();
      render(
        <TimeRangeButton
          range="7d"
          isActive={true}
          onClick={mockOnClick3}
        />
      );

      const button = screen.getByRole('button', { name: '7d' });
      await user.click(button);

      expect(mockOnClick3).toHaveBeenCalledTimes(1);
      expect(mockOnClick3).toHaveBeenCalledWith('7d');
    });

    it('should handle multiple clicks independently', async () => {
      const user = userEvent.setup();
      const mockOnClick4 = vi.fn();
      render(
        <TimeRangeButton
          range="7d"
          isActive={false}
          onClick={mockOnClick4}
        />
      );

      const button = screen.getByRole('button', { name: '7d' });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick4).toHaveBeenCalledTimes(3);
      expect(mockOnClick4).toHaveBeenNthCalledWith(1, '7d');
      expect(mockOnClick4).toHaveBeenNthCalledWith(2, '7d');
      expect(mockOnClick4).toHaveBeenNthCalledWith(3, '7d');
    });
  });
});
