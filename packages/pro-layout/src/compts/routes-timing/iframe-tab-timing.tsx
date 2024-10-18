import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { hooks } from '@wove/react';
import { useIframe } from '../../hooks';

/**
 * iframe tab路由变化逻辑
 * @returns
 * ```
 * 注意：iframe main中无法监听路由变化
 * 1. iframe main的history是 外部浏览器 + 内部浏览器 的总和，无法单独监听外部浏览器
 * ```
 */
export const IframeTabRoutesTiming = () => {
  const iframeApi = useIframe();

  const { pathname, search } = useLocation();

  hooks.useUpdateEffect(() => {
    iframeApi.tabItemHistoryChange(location.href);
  }, [pathname, search]);

  return <Fragment />;
};
