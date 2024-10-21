import { isString } from '@dimjs/lang';
import { isUndefinedOrNull } from '../lang/is-empty.js';

/**
 * 移除字符串前后斜线
 * @param str
 * @param position
 * @returns
 * ```
 * 例如：
 * 1. removeSlash('/abc', 'before') => abc
 * 2. removeSlash('/abc/', 'after') => /abc
 * 3. removeSlash('/abc/', 'before-after') => abc
 * ```
 *
 */
export const removeSlash = (
  str: string,
  position: 'before' | 'after' | 'before-after'
) => {
  if (!isString(str) || isUndefinedOrNull(str)) return '';
  if (position === 'before' || position === 'before-after') {
    if (str.startsWith('/')) {
      str = str.substring(1);
    }
  }
  if (position === 'after' || position === 'before-after') {
    if (str.endsWith('/')) {
      str = str.substring(0, str.length - 1);
    }
  }
  return str;
};
