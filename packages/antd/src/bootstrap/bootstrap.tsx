import { CSSProperties, ReactNode, useEffect } from 'react';
import { App, theme } from 'antd';
import { get } from '@dimjs/utils';
import { TAny, toArray, TPlainObject } from '@hyperse/utils';
import {
  ConfigProviderWrapper,
  ConfigProviderWrapperProps,
} from '../config-provider-wrapper/config-provider-wrapper.js';
import { FbaApp } from '../fba-app/fba-app.js';
import { fbaHooks } from '../fba-hooks/index.js';
import './style.less';

export type BootstrapProps = {
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 是否drak模式 */
  dark?: boolean;
  children: ReactNode;
  configProviderProps?: ConfigProviderWrapperProps;
  /** @default zhCN */
  locale?: 'en' | 'zh-cn';
  /**
   * 背景颜色配置
   * ```
   * 默认值：
   * dark: { bgColor: '#1b1a1a', blockBgColor: '#000'  }
   * light: { bgColor: '#f9f9f9', blockBgColor: '#FFF'  }
   * ```
   */
  bgColorConfig?: {
    dark?: {
      bgColor?: string;
      blockBgColor?: string;
    };
    light?: {
      bgColor?: string;
      blockBgColor?: string;
    };
  };
};
/**
 * 如果当前项目入口不使用@hyperse/pro-layout，必须使用 Bootstrap 组件包装
 * ```
 * Bootstrap 内部
 * 1. 封装 antd App组件
 * 2. 封装 @hyperse/antd FbaApp组件
 * 3. 适配 light/dark模式
 * 4. 封装 antd ConfigProvider 可配置主题
 * ```
 */
export const Bootstrap = (props: BootstrapProps) => {
  useEffect(() => {
    const bodyStyle = document.body.style.cssText;
    const keyValuePairs = {};
    if (bodyStyle) {
      const regex = /(.+?):\s*(.+?);/g;

      let match;
      while ((match = regex.exec(bodyStyle))) {
        const key = match[1].trim();
        const value = match[2];
        keyValuePairs[key] = value;
      }
    }
    if (props.dark) {
      keyValuePairs['--bg-color'] = get<TPlainObject, string>(
        props,
        'bgColorConfig.dark.bgColor',
        '#1b1a1a'
      );
      keyValuePairs['--block-bg-color'] = get<TPlainObject, string>(
        props,
        'bgColorConfig.dark.blockBgColor',
        '#000'
      );
    } else {
      keyValuePairs['--bg-color'] = get<TPlainObject, string>(
        props,
        'bgColorConfig.light.bgColor',
        '#f9f9f9'
      );
      keyValuePairs['--block-bg-color'] = get<TPlainObject, string>(
        props,
        'bgColorConfig.light.blockBgColor',
        '#FFF'
      );
    }
    let varStyleText = '';
    Object.keys(keyValuePairs).forEach((key) => {
      if (keyValuePairs[key]) {
        varStyleText = varStyleText + `${key}:${keyValuePairs[key]};`;
      }
    });
    document.body.style.cssText = varStyleText;

    if (props.dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
    if (props.compact) {
      document.body.classList.add('compact-theme');
    }
  }, [props.bgColorConfig, props.dark]);

  const innerTheme = fbaHooks.useThemeToken();

  const algorithm = props.configProviderProps?.theme?.algorithm;

  let algorithmArray = toArray<TAny>(algorithm);

  algorithmArray = [
    ...algorithmArray,
    props.dark ? theme.darkAlgorithm : null,
    props.compact ? theme.compactAlgorithm : null,
  ].filter(Boolean);

  return (
    <ConfigProviderWrapper
      locale={props.locale}
      componentSize={'middle'}
      space={{ size: 'middle' }}
      {...props.configProviderProps}
      theme={{
        ...props.configProviderProps?.theme,
        algorithm: algorithmArray,
      }}
    >
      <App
        style={{ '--color-primary': innerTheme.colorPrimary } as CSSProperties}
        className="bootstrap-app"
      >
        <FbaApp>{props.children}</FbaApp>
      </App>
    </ConfigProviderWrapper>
  );
};
