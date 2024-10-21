import { price } from '@dimjs/utils';
import { isNumber } from '../number/is-number.js';

/**
 * 金额转换 分 => 元
 */
export const priceFen2yuan = (
  amt?: string | number,
  defaultValue: string | number = 0
) => {
  if (amt === undefined || amt === null || !isNumber(amt)) {
    if (!isNumber(defaultValue)) {
      return defaultValue as string;
    }
    amt = defaultValue;
  }
  return price(amt).divide(100).value;
};
