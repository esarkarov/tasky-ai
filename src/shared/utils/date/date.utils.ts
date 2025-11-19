import { toTitleCase } from '@/shared/utils/text/text.utils';
import { format, formatRelative, isSameYear } from 'date-fns';

const WEEKDAYS = [
  'Today',
  'Tomorrow',
  'Yesterday',
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export function formatCustomDate(date: string | Date) {
  const today = new Date();
  const relativeDay = toTitleCase(formatRelative(date, today).split(' at ')[0]);

  if (WEEKDAYS.includes(relativeDay)) {
    return relativeDay;
  }

  if (isSameYear(date, today)) {
    return format(date, 'dd MMM');
  } else {
    return format(date, 'dd MMM yyyy');
  }
}
