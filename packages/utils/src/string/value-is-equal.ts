import { isArray } from '@dimjs/lang';
import { isUndefinedOrNull } from '../lang/is-empty.js';
import { type TAny } from '../types/index.js';

/**
 * 两个值比较，只用于string、number类型的值比较
 * @param firstValue string、number
 * @param secondValue string、number、Array<string | number>
 * @returns
 * ```
 * 1. 不用区分具体是string还是number
 * 2. secondValue为数组时，firstValue只要和数组中的任意值相等，即返回true
 * ```
 */
export const valueIsEqual = (
  firstValue?: string | number | boolean,
  secondValue?: string | number | boolean | Array<string | number | boolean>
) => {
  const newFirst = !isUndefinedOrNull(firstValue) ? String(firstValue) : null;
  if (isArray(secondValue)) {
    const newSecond = (secondValue as TAny[]).map((item) => {
      return !isUndefinedOrNull(item) ? String(item) : null;
    });
    return newSecond.findIndex((item) => newFirst === item) >= 0;
  } else {
    const newSecond = !isUndefinedOrNull(secondValue)
      ? String(secondValue)
      : null;
    return newFirst === newSecond;
  }
};
