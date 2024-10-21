import { isArray } from '@dimjs/lang';
import { isUndefinedOrNull } from '../lang/is-empty.js';

/**
 * 转数组
 * @param array
 * @returns
 * ```
 * 例如
 * 1. undefined or null => []
 * 2. [1,2,3] => [1,2,3]
 * 2. 任意其他数据A => [A]
 * ```
 */
export const toArray = <T>(value?: unknown) => {
  if (isUndefinedOrNull(value)) return [];
  if (isArray(value)) return value as T[];
  return [value] as T[];
};
