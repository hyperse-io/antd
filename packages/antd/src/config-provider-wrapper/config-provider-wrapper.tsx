import { ConfigProvider } from 'antd';
import { type ConfigProviderProps } from 'antd/es/config-provider';
import enUS from 'antd/es/locale/en_US.js';
import zhCN from 'antd/es/locale/zh_CN.js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import localeData from 'dayjs/plugin/localeData.js';
import dayjsUtc from 'dayjs/plugin/utc.js';
import weekday from 'dayjs/plugin/weekday.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import weekYear from 'dayjs/plugin/weekYear.js';
import { setFbaLocaleMessage } from '../_utils/i18n/index.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { type TFbaLocale, type TLocale } from '../types/index.js';
import 'dayjs/locale/en.js';
import 'dayjs/locale/zh-cn.js';
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(dayjsUtc);

export type ConfigProviderWrapperProps = Omit<ConfigProviderProps, 'locale'> & {
  locale?: TLocale;
  /** 自定义国际化数据 */
  customLocaleMessage?: Partial<TFbaLocale>;
  /** 同 fbaHooks.useCopyRemoveSpace[ignoreClass]  */
  copyOperateIgnoreClass?: string[];
};

const localeMap = {
  en: {
    dayjs: 'en',
    antd: enUS,
  },
  'zh-cn': {
    dayjs: 'zh-cn',
    antd: zhCN,
  },
};

/**
 *  antd ConfigProvider 扩展类
 * ```
 * 1. 新增监听辅助行为，移除复制文本中前后空格能力
 * ```
 */
export const ConfigProviderWrapper = (props: ConfigProviderWrapperProps) => {
  const { locale, ...otherProps } = props;
  const localeNew = locale || 'zh-cn';
  fbaHooks.useEffectCustom(() => {
    setFbaLocaleMessage(localeNew, props.customLocaleMessage);
    dayjs.locale(localeMap[localeNew].dayjs || localeMap['zh-cn'].dayjs);
  }, []);

  fbaHooks.useCopyRemoveSpace({
    ignoreClass: props.copyOperateIgnoreClass,
  });

  return (
    <ConfigProvider
      componentSize={'middle'}
      space={{ size: 'middle' }}
      {...otherProps}
      locale={(localeMap[localeNew].antd || localeMap['zh-cn'].antd) as any}
    >
      {props.children}
    </ConfigProvider>
  );
};
