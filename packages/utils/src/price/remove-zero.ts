import { price } from '@dimjs/utils';
import { isNumber } from '../number/is-number';

/**
 * 金额去除小数点尾号零（会四舍五入处理，默认添加分隔符）
 * ```
 * 例如：
 * 19.00 => 19
 * 19.90 => 19.9
 * 1999.90 => 1,999.9
 * 99.9999 => 100
 * ```
 */
export const priceRemoveTailZero = (
  amt?: string | number,
  defaultValue: string | number = 0,
  options?: {
    /** 是否显示分隔符，默认值：true */
    separator: boolean;
  }
) => {
  if (amt === undefined || amt === null || !isNumber(amt)) {
    if (!isNumber(defaultValue)) {
      return defaultValue as string;
    }
    amt = defaultValue;
  }
  amt = price(amt, { precision: 2, symbol: '', separator: '' }).format();
  const priceFt = String(parseFloat(amt)).split('.');
  const separator = options?.separator === false ? '' : ',';
  const firstValue = price(priceFt[0], {
    precision: 0,
    symbol: '',
    separator,
  }).format();
  return `${firstValue}${priceFt[1] ? `.${priceFt[1]}` : ''}`;
};
