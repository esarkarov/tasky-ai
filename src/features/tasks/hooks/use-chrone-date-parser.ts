import * as chrono from 'chrono-node';
import { useEffect } from 'react';
import { UseChronoDateParserParams } from '../types';

export const useChronoDateParser = ({ content, onDateParsed, enabled = true }: UseChronoDateParserParams) => {
  useEffect(() => {
    if (!enabled || !content) return;

    const chronoParsed = chrono.parse(content);
    if (chronoParsed.length > 0) {
      const lastDate = chronoParsed[chronoParsed.length - 1];
      onDateParsed(lastDate.date());
    }
  }, [content, onDateParsed, enabled]);
};
