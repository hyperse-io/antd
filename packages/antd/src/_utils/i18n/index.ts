import { extend } from '@dimjs/utils';
import { TFbaLocale, TLocale } from '../../types/index.js';
import { en } from './en.js';
import { zhCn } from './zh-cn.js';

/**
 * 设置 @flatbiz/antd中的国际化语言
 * @param locale
 * @param customLocaleMessage
 */
export const setFbaLocaleMessage = (
  locale: TLocale,
  customLocaleMessage?: Partial<TFbaLocale>
) => {
  let localeMessage = zhCn;
  if (locale === 'en') {
    localeMessage = en;
  }
  window['__fba_locale_message'] = extend(
    true,
    {},
    localeMessage,
    customLocaleMessage
  );
};

/**
 * 读取 @flatbiz/antd中的国际化语言
 * @param key
 * @returns
 */
export const getFbaLocaleMessage = () => {
  const localeMessage = window['__fba_locale_message'] as TFbaLocale;
  return localeMessage || {};
};
