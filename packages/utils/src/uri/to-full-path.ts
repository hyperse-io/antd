import { isHttpUrl } from '@dimjs/utils';

/**
 * 根据当前地址协议，获取完整的url地址
 * ```
 * 例如
 * //xxx.com => https://xxx.com
 * ```
 */
export const toFullPath = (url: string) => {
  if (isHttpUrl(url)) {
    if (url.startsWith('//')) {
      return `${location.protocol}${url}`;
    }
  }
  return url;
};
