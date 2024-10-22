import { dateFormat as dateFormatFn } from '@dimjs/utils';
import { dateNormalize } from './date-normalize.js';
import { isDate } from './is-date.js';
import { type DateFormatType, type DateType } from './types.js';

export const dateFormat = (
  dateInput: DateType,
  format: DateFormatType = 'YYYY-MM-DD'
) => {
  if (!isDate(dateInput)) {
    return `${dateInput || ''}`;
  }
  return dateFormatFn(dateNormalize(dateInput), format);
};
