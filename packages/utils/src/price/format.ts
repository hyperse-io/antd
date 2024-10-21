import { price } from '@dimjs/utils';
import { isNumber } from '../number/is-number.js';

/**
 * 格式化金额保留小数点后2位
 */
export const priceFormat = (
  amt?: string | number,
  defaultValue: string | number = 0,
  options?: {
    /** 是否显示分隔符，默认值：true */
    separator?: boolean;
    /** 小数点后位数，默认：2 */
    precision?: number;
  }
) => {
  if (amt === undefined || amt === null || !isNumber(amt)) {
    if (!isNumber(defaultValue)) {
      return defaultValue as string;
    }
    amt = defaultValue;
  }
  const separator = options?.separator === false ? '' : ',';
  const precision = options?.precision ? options.precision : 2;
  return price(amt, { precision, symbol: '', separator }).format();
};
