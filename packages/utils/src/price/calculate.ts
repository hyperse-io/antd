import { extend, price, type PriceOption } from '@dimjs/utils';

/**
 * 金额计算：加
 */
export const add = (
  amt: string | number,
  amt2: string | number,
  option?: PriceOption
) => {
  return price(amt, extend({ precision: 10 }, option)).add(amt2).value;
};

/**
 * 金额计算：减
 */
export const subtract = (
  amt: string | number,
  amt2: string | number,
  option?: PriceOption
) => {
  return price(amt, extend({ precision: 10 }, option)).subtract(amt2).value;
};

/**
 * 金额计算：乘
 */
export const multiply = (
  amt: string | number,
  amt2: string | number,
  option?: PriceOption
) => {
  return price(amt, extend({ precision: 10 }, option)).multiply(amt2).value;
};

/**
 * 金额计算：除
 */
export const divide = (
  amt: string | number,
  amt2: string | number,
  option?: PriceOption
) => {
  return price(amt, extend({ precision: 10 }, option)).divide(amt2).value;
};
