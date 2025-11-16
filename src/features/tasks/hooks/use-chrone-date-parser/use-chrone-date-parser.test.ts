import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChronoDateParser } from './use-chrone-date-parser';

vi.mock('chrono-node', () => ({
  default: {
    parse: vi.fn(),
  },
  parse: vi.fn(),
}));

describe('useChronoDateParser', () => {
  const mockOnDateParsed = vi.fn();
  let chronoParse: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const chrono = vi.mocked(await import('chrono-node'));
    chronoParse = chrono.parse as ReturnType<typeof vi.fn>;
  });

  describe('Date Parsing', () => {
    it('should parse date from content and call onDateParsed', () => {
      const mockDate = new Date('2024-12-25');
      chronoParse.mockReturnValue([
        {
          date: () => mockDate,
        },
      ]);

      renderHook(() =>
        useChronoDateParser({
          content: 'Meeting tomorrow at 3pm',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(chronoParse).toHaveBeenCalledWith('Meeting tomorrow at 3pm');
      expect(mockOnDateParsed).toHaveBeenCalledWith(mockDate);
      expect(mockOnDateParsed).toHaveBeenCalledTimes(1);
    });

    it('should use the last parsed date when multiple dates are found', () => {
      const firstDate = new Date('2024-12-20');
      const lastDate = new Date('2024-12-25');

      chronoParse.mockReturnValue([{ date: () => firstDate }, { date: () => lastDate }]);

      renderHook(() =>
        useChronoDateParser({
          content: 'From Monday to Friday',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(mockOnDateParsed).toHaveBeenCalledWith(lastDate);
      expect(mockOnDateParsed).not.toHaveBeenCalledWith(firstDate);
    });

    it('should not call onDateParsed when no dates are found', () => {
      chronoParse.mockReturnValue([]);

      renderHook(() =>
        useChronoDateParser({
          content: 'No dates here',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(chronoParse).toHaveBeenCalledWith('No dates here');
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });
  });

  describe('Enabled/Disabled State', () => {
    it('should not parse when enabled is false', () => {
      renderHook(() =>
        useChronoDateParser({
          content: 'Meeting tomorrow',
          onDateParsed: mockOnDateParsed,
          enabled: false,
        })
      );

      expect(chronoParse).not.toHaveBeenCalled();
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });

    it('should parse when enabled is true', () => {
      const mockDate = new Date('2024-12-25');
      chronoParse.mockReturnValue([{ date: () => mockDate }]);

      renderHook(() =>
        useChronoDateParser({
          content: 'Meeting tomorrow',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(chronoParse).toHaveBeenCalled();
      expect(mockOnDateParsed).toHaveBeenCalled();
    });

    it('should default to enabled when enabled prop is not provided', () => {
      const mockDate = new Date('2024-12-25');
      chronoParse.mockReturnValue([{ date: () => mockDate }]);

      renderHook(() =>
        useChronoDateParser({
          content: 'Meeting tomorrow',
          onDateParsed: mockOnDateParsed,
        })
      );

      expect(chronoParse).toHaveBeenCalled();
      expect(mockOnDateParsed).toHaveBeenCalled();
    });
  });

  describe('Content Changes', () => {
    it('should re-parse when content changes', () => {
      const mockDate1 = new Date('2024-12-20');
      const mockDate2 = new Date('2024-12-25');

      chronoParse.mockReturnValueOnce([{ date: () => mockDate1 }]);

      const { rerender } = renderHook(
        ({ content }) =>
          useChronoDateParser({
            content,
            onDateParsed: mockOnDateParsed,
            enabled: true,
          }),
        { initialProps: { content: 'Meeting on Monday' } }
      );

      expect(mockOnDateParsed).toHaveBeenCalledWith(mockDate1);

      chronoParse.mockReturnValueOnce([{ date: () => mockDate2 }]);

      rerender({ content: 'Meeting on Friday' });

      expect(chronoParse).toHaveBeenCalledTimes(2);
      expect(mockOnDateParsed).toHaveBeenCalledTimes(2);
      expect(mockOnDateParsed).toHaveBeenLastCalledWith(mockDate2);
    });

    it('should not parse when content is empty', () => {
      renderHook(() =>
        useChronoDateParser({
          content: '',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(chronoParse).not.toHaveBeenCalled();
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });

    it('should not parse when content is null or undefined', () => {
      renderHook(() =>
        useChronoDateParser({
          content: null as unknown as string,
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(chronoParse).not.toHaveBeenCalled();
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });
  });

  describe('Callback Stability', () => {
    it('should re-run when onDateParsed callback changes', () => {
      const mockDate = new Date('2024-12-25');
      chronoParse.mockReturnValue([{ date: () => mockDate }]);

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { rerender } = renderHook(
        ({ onDateParsed }) =>
          useChronoDateParser({
            content: 'Meeting tomorrow',
            onDateParsed,
            enabled: true,
          }),
        { initialProps: { onDateParsed: callback1 } }
      );

      expect(callback1).toHaveBeenCalledWith(mockDate);
      expect(callback1).toHaveBeenCalledTimes(1);

      rerender({ onDateParsed: callback2 });

      expect(callback2).toHaveBeenCalledWith(mockDate);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(chronoParse).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle various date formats', () => {
      const mockDate = new Date('2024-12-25');
      chronoParse.mockReturnValue([{ date: () => mockDate }]);

      const { rerender } = renderHook(
        ({ content }) =>
          useChronoDateParser({
            content,
            onDateParsed: mockOnDateParsed,
            enabled: true,
          }),
        { initialProps: { content: 'tomorrow' } }
      );

      expect(mockOnDateParsed).toHaveBeenCalledWith(mockDate);

      rerender({ content: 'next Friday' });
      expect(chronoParse).toHaveBeenCalledWith('next Friday');

      rerender({ content: '2024-12-25' });
      expect(chronoParse).toHaveBeenCalledWith('2024-12-25');
    });

    it('should handle content with no date-like strings', () => {
      chronoParse.mockReturnValue([]);

      renderHook(() =>
        useChronoDateParser({
          content: 'Just some random text',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(chronoParse).toHaveBeenCalled();
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });
  });
});
