import { isNumber, isPlainObject } from '@dimjs/lang';
import { type TPlainObject } from '../types/index.js';

/**
 * 数组字段求和
 * @param array
 * @param fieldKey 求和字段，如果数组项为Object
 * @returns
 */
export const arrayTotal = (
  array: Array<TPlainObject | number>,
  fieldKey?: string
) => {
  let total = 0;
  array.forEach((item) => {
    if (typeof item === 'number') {
      total += item;
    } else if (isPlainObject(item) && fieldKey && isNumber(item[fieldKey])) {
      total += item[fieldKey];
    }
  });
  return total;
};
