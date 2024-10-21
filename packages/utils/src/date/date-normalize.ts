import { dateNormalize as dateNormalizeFn } from '@dimjs/utils';
import { DateType } from './types.js';
/**
 * 指定数据转日期格式
 * @param dateInput
 * @returns
 */
export const dateNormalize = (dateInput: DateType) => {
  if (!dateInput) {
    throw new Error(`Invalid Date : "${String(dateInput)}"`);
  }
  return dateNormalizeFn(dateInput);
};
