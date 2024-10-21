import { trim } from './trim.js';

/**
 * 获取字符串字节长度
 * @param str
 * @returns
 */
export const getStrByteLen = (str: string) => {
  const c = str.match(/[^x00-xff]/gi);
  return str.length + (c == null ? 0 : c.length);
};

/**
 * 根据字节长度截取字符串
 * @param str
 * @param bytes
 * @returns
 */
export const subStringByBytes = (str: string, bytes: number) => {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    len += str.charCodeAt(i) > 255 ? 2 : 1;
    if (len > bytes) {
      return str.substring(0, i);
    }
  }
  return str;
};

/**
 * 根据[字节长度]来截取字符串
 * @param str 待截取字符数据
 * @param len 截取字节长度
 * @param flow 溢出符，默认...
 */
export const cutString = (
  str: string,
  bytes: number,
  flow?: string
): string => {
  str = trim(str || '', true);
  if (!str) return '';
  const cutStr = subStringByBytes(str, bytes);
  if (str.length > cutStr.length) {
    return `${cutStr}${flow || '...'}`;
  }
  return cutStr;
};
