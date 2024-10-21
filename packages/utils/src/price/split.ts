import { price } from '@dimjs/utils';
import { isNumber } from '../number/is-number.js';

/**
 * 金额分割（会四舍五入处理，默认添加分隔符）
 * ```
 * 例如：
 * 19.09 => ['19', '.09']
 * 99.00 => ['99', '.00']
 * 99.999 => ['100', '.00']
 * ```
 */
export const priceSplit = (
  amt?: string | number,
  defaultValue: string | number = 0,
  options?: {
    /** 是否显示分隔符，默认值：true */
    separator?: boolean;
    /** 小数点后位数，默认：2 */
    precision?: number;
  }
): string[] => {
  if (amt === undefined || amt === null || !isNumber(amt)) {
    if (!isNumber(defaultValue)) {
      return [defaultValue as string, ''];
    }
    amt = defaultValue;
  }
  const precision = options?.precision ? options.precision : 2;

  const priceFt = price(amt, { precision, symbol: '', separator: '' })
    .format()
    .split('.');

  const separator = options?.separator === false ? '' : ',';

  const firstValue = price(priceFt[0], {
    precision: 0,
    symbol: '',
    separator,
  }).format();
  return [firstValue, `.${priceFt[1]}`];
};
