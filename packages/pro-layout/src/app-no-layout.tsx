import { Fragment } from 'react';
import { type AppRouteProps, AppRoutes } from './app-routes';
import useAntdApp from './compts/antd-app';
import { ContentLayoutCheck } from './compts/content-layout-check';
import { ErrorHandling } from './compts/error-handling';
import { IframeTabRoutesTiming } from './compts/routes-timing/iframe-tab-timing';
import { LayoutPage } from './layout/layout-page';
import { type BootstrapOptions } from './types';

export type AppProps = AppRouteProps & {
  iframeTabAloneView?: boolean;
  layoutMode: BootstrapOptions['layoutMode'];
  LayoutComponent: BootstrapOptions['LayoutComponent'];
  hideHeader?: boolean;
  /**
   * 是否禁用全局异常处理
   * 如果未设置ErrorHandling，则走默认ErrorHandling逻辑
   */
  disableErrorHandling?: boolean;
  /**
   * 自定义ErrorHandling
   */
  ErrorHandling?: (() => JSX.Element) | null;
  verifySessionExpired?: (err) => boolean;
  layoutPageClassName?: string;
};

/**
 * 无结构渲染，用于 layoutMode 为 no-layout、iframe-tab 场景
 * @param props
 * @returns
 */
export const AppNoLayout = (props: AppProps) => {
  useAntdApp();

  const LayoutContent = props.LayoutComponent || LayoutPage;

  const ErrorHandlingRender = props.ErrorHandling || ErrorHandling;
  return (
    <ContentLayoutCheck
      layoutMode={props.iframeTabAloneView ? undefined : props.layoutMode}
    >
      <Fragment>
        {props.disableErrorHandling ? null : (
          <ErrorHandlingRender
            verifySessionExpired={props.verifySessionExpired}
          />
        )}
        {props.layoutMode === 'iframe-tab' && <IframeTabRoutesTiming />}
        <LayoutContent
          hideHeader={props.hideHeader}
          className={props.layoutPageClassName}
        >
          <AppRoutes {...props} />
        </LayoutContent>
      </Fragment>
    </ContentLayoutCheck>
  );
};