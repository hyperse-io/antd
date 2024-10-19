import { price } from '@dimjs/utils';
import { isNumber } from '../number/is-number';

/**
 * 金额转换 分 => 万元
 */
export const priceFen2wan = (
  amt?: string | number,
  defaultValue: string | number = 0
) => {
  if (amt === undefined || amt === null || !isNumber(amt)) {
    if (!isNumber(defaultValue)) {
      return defaultValue as string;
    }
    amt = defaultValue;
  }
  return price(amt).divide(1000000).value;
};