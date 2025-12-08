import { useChronoDateParser } from '@/features/tasks/hooks/use-chrone-date-parser/use-chrone-date-parser';
import { renderHook } from '@testing-library/react';
import * as chrono from 'chrono-node';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('chrono-node', () => ({
  parse: vi.fn(),
}));

const mockChronoParse = vi.mocked(chrono.parse);

describe('useChronoDateParser', () => {
  const mockOnDateParsed = vi.fn();
  const mockDate = new Date('2024-12-25T15:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createChronoResult = (date: Date) =>
    ({
      date: () => date,
      refDate: date,
      index: 0,
      text: '',
      start: {
        get: vi.fn(),
        date: () => date,
        impliedValues: {},
        knownValues: {},
        isCertain: vi.fn(),
      },
    }) as unknown as chrono.ParsedResult;

  describe('initialization', () => {
    it('should parse date and call onDateParsed when enabled by default', () => {
      mockChronoParse.mockReturnValue([createChronoResult(mockDate)]);

      renderHook(() =>
        useChronoDateParser({
          content: 'Meeting tomorrow at 3pm',
          onDateParsed: mockOnDateParsed,
        })
      );

      expect(mockChronoParse).toHaveBeenCalledWith('Meeting tomorrow at 3pm');
      expect(mockOnDateParsed).toHaveBeenCalledWith(mockDate);
      expect(mockOnDateParsed).toHaveBeenCalledTimes(1);
    });

    it('should parse date when explicitly enabled', () => {
      mockChronoParse.mockReturnValue([createChronoResult(mockDate)]);

      renderHook(() =>
        useChronoDateParser({
          content: 'Meeting tomorrow',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(mockChronoParse).toHaveBeenCalledWith('Meeting tomorrow');
      expect(mockOnDateParsed).toHaveBeenCalledWith(mockDate);
    });

    it('should not parse when disabled', () => {
      renderHook(() =>
        useChronoDateParser({
          content: 'Meeting tomorrow',
          onDateParsed: mockOnDateParsed,
          enabled: false,
        })
      );

      expect(mockChronoParse).not.toHaveBeenCalled();
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });
  });

  describe('date parsing behavior', () => {
    it('should use the last date when multiple dates are found', () => {
      const firstDate = new Date('2024-12-20T10:00:00.000Z');
      const lastDate = new Date('2024-12-25T15:00:00.000Z');

      mockChronoParse.mockReturnValue([createChronoResult(firstDate), createChronoResult(lastDate)]);

      renderHook(() =>
        useChronoDateParser({
          content: 'From Monday to Friday',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(mockOnDateParsed).toHaveBeenCalledWith(lastDate);
      expect(mockOnDateParsed).toHaveBeenCalledTimes(1);
    });

    it('should not call onDateParsed when no dates are found', () => {
      mockChronoParse.mockReturnValue([]);

      renderHook(() =>
        useChronoDateParser({
          content: 'No dates here',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(mockChronoParse).toHaveBeenCalledWith('No dates here');
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });

    it('should not call onDateParsed when content has no date-like strings', () => {
      mockChronoParse.mockReturnValue([]);

      renderHook(() =>
        useChronoDateParser({
          content: 'Just some random text',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(mockChronoParse).toHaveBeenCalledWith('Just some random text');
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });
  });

  describe('content validation', () => {
    it('should not parse when content is empty string', () => {
      renderHook(() =>
        useChronoDateParser({
          content: '',
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(mockChronoParse).not.toHaveBeenCalled();
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });

    it('should not parse when content is null', () => {
      renderHook(() =>
        useChronoDateParser({
          content: null as unknown as string,
          onDateParsed: mockOnDateParsed,
          enabled: true,
        })
      );

      expect(mockChronoParse).not.toHaveBeenCalled();
      expect(mockOnDateParsed).not.toHaveBeenCalled();
    });
  });

  describe('content changes', () => {
    it('should re-parse when content changes', () => {
      const firstDate = new Date('2024-12-20T10:00:00.000Z');
      const secondDate = new Date('2024-12-25T15:00:00.000Z');

      mockChronoParse.mockReturnValueOnce([createChronoResult(firstDate)]);

      const { rerender } = renderHook(
        ({ content }) =>
          useChronoDateParser({
            content,
            onDateParsed: mockOnDateParsed,
            enabled: true,
          }),
        { initialProps: { content: 'Meeting on Monday' } }
      );

      expect(mockOnDateParsed).toHaveBeenCalledWith(firstDate);
      expect(mockChronoParse).toHaveBeenCalledTimes(1);

      mockChronoParse.mockReturnValueOnce([createChronoResult(secondDate)]);

      rerender({ content: 'Meeting on Friday' });

      expect(mockChronoParse).toHaveBeenCalledWith('Meeting on Friday');
      expect(mockChronoParse).toHaveBeenCalledTimes(2);
      expect(mockOnDateParsed).toHaveBeenCalledWith(secondDate);
      expect(mockOnDateParsed).toHaveBeenCalledTimes(2);
    });

    it('should handle various date format changes', () => {
      mockChronoParse.mockReturnValue([createChronoResult(mockDate)]);

      const { rerender } = renderHook(
        ({ content }) =>
          useChronoDateParser({
            content,
            onDateParsed: mockOnDateParsed,
            enabled: true,
          }),
        { initialProps: { content: 'tomorrow' } }
      );

      expect(mockChronoParse).toHaveBeenCalledWith('tomorrow');
      expect(mockOnDateParsed).toHaveBeenCalledWith(mockDate);

      rerender({ content: 'next Friday' });
      expect(mockChronoParse).toHaveBeenCalledWith('next Friday');

      rerender({ content: '2024-12-25' });
      expect(mockChronoParse).toHaveBeenCalledWith('2024-12-25');

      expect(mockChronoParse).toHaveBeenCalledTimes(3);
    });
  });

  describe('callback changes', () => {
    it('should re-run parsing when onDateParsed callback changes', () => {
      mockChronoParse.mockReturnValue([createChronoResult(mockDate)]);

      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      const { rerender } = renderHook(
        ({ onDateParsed }) =>
          useChronoDateParser({
            content: 'Meeting tomorrow',
            onDateParsed,
            enabled: true,
          }),
        { initialProps: { onDateParsed: firstCallback } }
      );

      expect(firstCallback).toHaveBeenCalledWith(mockDate);
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(mockChronoParse).toHaveBeenCalledTimes(1);

      rerender({ onDateParsed: secondCallback });

      expect(secondCallback).toHaveBeenCalledWith(mockDate);
      expect(secondCallback).toHaveBeenCalledTimes(1);
      expect(mockChronoParse).toHaveBeenCalledTimes(2);
    });
  });

  describe('enabled state changes', () => {
    it('should not re-parse when changing from enabled to disabled', () => {
      mockChronoParse.mockReturnValue([createChronoResult(mockDate)]);

      const { rerender } = renderHook(
        ({ enabled }) =>
          useChronoDateParser({
            content: 'Meeting tomorrow',
            onDateParsed: mockOnDateParsed,
            enabled,
          }),
        { initialProps: { enabled: true } }
      );

      expect(mockChronoParse).toHaveBeenCalledTimes(1);
      expect(mockOnDateParsed).toHaveBeenCalledTimes(1);

      rerender({ enabled: false });

      expect(mockChronoParse).toHaveBeenCalledTimes(1);
      expect(mockOnDateParsed).toHaveBeenCalledTimes(1);
    });

    it('should re-parse when changing from disabled to enabled', () => {
      mockChronoParse.mockReturnValue([createChronoResult(mockDate)]);

      const { rerender } = renderHook(
        ({ enabled }) =>
          useChronoDateParser({
            content: 'Meeting tomorrow',
            onDateParsed: mockOnDateParsed,
            enabled,
          }),
        { initialProps: { enabled: false } }
      );

      expect(mockChronoParse).not.toHaveBeenCalled();
      expect(mockOnDateParsed).not.toHaveBeenCalled();

      rerender({ enabled: true });

      expect(mockChronoParse).toHaveBeenCalledWith('Meeting tomorrow');
      expect(mockChronoParse).toHaveBeenCalledTimes(1);
      expect(mockOnDateParsed).toHaveBeenCalledWith(mockDate);
      expect(mockOnDateParsed).toHaveBeenCalledTimes(1);
    });
  });
});
