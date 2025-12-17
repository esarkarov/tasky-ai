import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TimeRangeButton } from './TimeRangeButton';

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
          range="7d"
          isActive={false}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button', { name: '7d' });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('7d');
    });

    it('should call onClick with correct range when different range is clicked', async () => {
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

    it('should call onClick when active button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TimeRangeButton
          range="7d"
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button', { name: '7d' });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('7d');
    });

    it('should handle multiple clicks independently', async () => {
      const user = userEvent.setup();
      render(
        <TimeRangeButton
          range="7d"
          isActive={false}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button', { name: '7d' });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, '7d');
      expect(mockOnClick).toHaveBeenNthCalledWith(2, '7d');
      expect(mockOnClick).toHaveBeenNthCalledWith(3, '7d');
    });
  });
});
