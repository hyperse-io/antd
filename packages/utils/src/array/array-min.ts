import { isNumber, isPlainObject } from '@dimjs/lang';
import { type TPlainObject } from '../types/index.js';

/**
 * 数组中指定数值字段最小值
 * @param array
 * @param fieldKey 数值字段，如果数组项为Object
 * @returns
 */
export const arrayMin = (
  array: Array<TPlainObject | number>,
  fieldKey?: string
) => {
  let min: number | undefined;
  array.forEach((item) => {
    let itemValue = item as number;
    if (isPlainObject(item) && fieldKey && isNumber(item[fieldKey])) {
      itemValue = item[fieldKey] as number;
    }
    if (!min) min = itemValue;
    min = itemValue < min ? itemValue : min;
  });
  return min as number;
};
