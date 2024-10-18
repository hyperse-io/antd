import { dateNormalize } from './date-normalize';
import { DateType } from './types';

/**
 * 判断日期是否合法
 * @returns boolean
 */
export const isDate = (dateInput: DateType) => {
  try {
    return !!dateNormalize(dateInput);
  } catch (_error) {
    return false;
  }
};
