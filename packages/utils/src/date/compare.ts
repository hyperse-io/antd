import { dateNormalize } from './date-normalize.js';
import { DateType } from './types.js';

/**
 * 日期比较：大于等于
 */
export const dateTimeGte = (date1: DateType, date2: DateType) => {
  const date1Fmt = dateNormalize(date1);
  const date2Fmt = dateNormalize(date2);
  return new Date(date1Fmt).getTime() >= new Date(date2Fmt).getTime();
};

/**
 * 日期比较：大于
 */
export const dateTimeGt = (date1: DateType, date2: DateType) => {
  const date1Fmt = dateNormalize(date1);
  const date2Fmt = dateNormalize(date2);
  return new Date(date1Fmt).getTime() > new Date(date2Fmt).getTime();
};

/**
 * 日期比较：等于
 */
export const dateTimeEq = (date1: DateType, date2: DateType) => {
  const date1Fmt = dateNormalize(date1);
  const date2Fmt = dateNormalize(date2);
  return new Date(date1Fmt).getTime() === new Date(date2Fmt).getTime();
};

/**
 * 判断目标日期是否在指定区间内，包含临界值
 * @param targetDate
 * @param minDate
 * @param maxDate
 * ```
 * 例如：targetDate >= minDate && targetDate <= maxDate
 * ```
 */
export const dateTimeIn = (
  targetDate: DateType,
  minDate: DateType,
  maxDate: DateType
) => {
  return dateTimeGte(targetDate, minDate) && dateTimeGte(maxDate, targetDate);
};
