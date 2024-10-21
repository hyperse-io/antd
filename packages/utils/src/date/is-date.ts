import { dateNormalize } from './date-normalize.js';
import { DateType } from './types.js';

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
