/**
 * 字符串前后斜线，拼接和取消
 * @param str
 * @param slashFix 默认值 true
 * @returns
 * ```
 * 例如：
 * 1. ensureSlash('/abc', true) => /abc/
 * 2. ensureSlash('abc', true) => /abc/
 * 3. ensureSlash('/abc/', false) => abc
 * ```
 *
 */
export const ensureSlash = (str: string, slashFix = true) => {
  str = str.replace(/\/$/, '').replace(/^\//, '');
  return slashFix ? `/${str}/` : str;
};
