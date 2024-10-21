import { price } from '@dimjs/utils';
import { isNumber } from '../number/is-number.js';

export const priceWan2fen = (
  amt?: string | number,
  defaultValue: string | number = 0
) => {
  if (amt === undefined || amt === null || !isNumber(amt)) {
    if (!isNumber(defaultValue)) {
      return defaultValue as string;
    }
    amt = defaultValue;
  }
  return price(amt).multiply(1000000).value;
};
