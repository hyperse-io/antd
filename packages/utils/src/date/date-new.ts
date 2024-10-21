import { dateNew as dateNewFn } from '@dimjs/utils';
import { dateNormalize } from './date-normalize.js';
import { DateType } from './types.js';
/**
 * 在日期【'y' | 'm' | 'd' | 'h' | 'mi' | 's'】中进行加减值处理
 * @param dateInput
 * @param mode 类型 'y' | 'm' | 'd' | 'h' | 'mi' | 's'
 * @param number
 * @returns
 */
export const dateNew = (
  dateInput: DateType,
  mode: 'y' | 'm' | 'd' | 'h' | 'mi' | 's',
  number: number
) => {
  return dateNewFn(dateNormalize(dateInput), mode, number);
};
