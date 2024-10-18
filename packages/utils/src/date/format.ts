import { dateFormat as dateFormatFn } from '@dimjs/utils';
import { dateNormalize } from './date-normalize';
import { isDate } from './is-date';
import { DateFormatType, DateType } from './types';

export const dateFormat = (
  dateInput: DateType,
  format: DateFormatType = 'YYYY-MM-DD'
) => {
  if (!isDate(dateInput)) {
    return `${dateInput || ''}`;
  }
  return dateFormatFn(dateNormalize(dateInput), format);
};
