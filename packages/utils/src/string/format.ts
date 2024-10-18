import { isArray } from '@dimjs/lang';
import { trim } from './trim';

/**
 * 字符串格式化
 * @param value 字符串
 * @param format 格式化间隙
 * @returns
 * ```
 * format('18512345678', [3, 4, 4]) => ['185', '1234', '5678']
 * format('18512345678', [3, 2]) => ['185', '12', '345678']
 * format('18512345678', [3, 20]) => ['185', '12345678']
 * format('18512345678', []) => ['18512345678']
 * ```
 */
export const stringFormat = (value: string, format: number[]) => {
  try {
    const newValue = trim(value || '');
    if (!isArray(format) || format.length === 0) return [newValue];
    const accumulation: { min: number; max: number }[] = [];
    format.forEach((item, index) => {
      if (index === 0) {
        accumulation.push({ min: 0, max: item });
      } else {
        const preValue = accumulation[index - 1].max;
        const currentValue = item + preValue;
        accumulation.push({ min: preValue, max: currentValue });
        if (index === format.length - 1 && currentValue < newValue.length) {
          accumulation.push({ min: currentValue, max: newValue.length });
        }
      }
    });
    const strArray: string[] = [];
    accumulation.forEach((item) => {
      const temp = newValue.substring(item.min, item.max);
      if (temp) {
        strArray.push(temp);
      }
    });
    return strArray;
  } catch (error) {
    console.error(error);
  }
  return [];
};
