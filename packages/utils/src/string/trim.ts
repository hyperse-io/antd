import { isString } from '@dimjs/lang';

/**
 * 清除空格，可清除前后空格或所有空格
 * @param str
 * @param cancelGlobal 取消所有，只清除前后空格
 */
export const trim = (str: string, cancelGlobal?: boolean): string => {
  if (!str || !isString(str)) return str;
  const patt = cancelGlobal ? /(^\s+)|(\s+$)/g : /\s/g;
  return str.replace(patt, '');
};
