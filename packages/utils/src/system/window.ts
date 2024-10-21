import { getUuid } from '../string/uuid.js';
import { TPlainObject } from '../types/define.js';

export const getGlobalData = <T>() => {
  return (window['GLOBAL'] || {}) as T;
};

export const getWindow = <T>(key: string) => {
  return window[key] as T;
};

export const setWindow = (data: TPlainObject) => {
  Object.keys(data).map((key) => {
    window[key] = data[key];
  });
};

/**
 * Web浏览器打开新窗口，替代window.open
 * ```
 * 直接使用window.open会被浏览器拦截
 * ```
 */
export const openNewWindow = (url: string) => {
  const id = getUuid();
  const aElement = document.createElement('a');
  aElement.setAttribute('href', url);
  aElement.setAttribute('target', '_blank');
  aElement.setAttribute('id', id);
  aElement.click();
  setTimeout(() => {
    aElement.parentNode?.removeChild(aElement);
  }, 200);
};
