import { Fragment } from 'react';
import { Layout } from 'antd';
import { classNames } from '@dimjs/utils';
import { isWindowsEnv } from '@hyperse/utils';
import { AppRoutes } from './app-routes';
import useAntdApp from './compts/antd-app';
import { Header } from './compts/header';
import { SiderBar } from './compts/sider-bar';
import { useLayoutCtx } from './context/layout-ctx';
import { LayoutIFrame } from './layout/layout-iframe';
import { EventHandling } from './layout/layout-iframe/event-handling';
import { LayoutPage } from './layout/layout-page';

export const App = () => {
  const layoutCtx = useLayoutCtx();
  const isIframeMain = layoutCtx.layoutMode === 'iframe-main';
  useAntdApp();

  const LayoutContent = layoutCtx.LayoutComponent || LayoutPage;

  const isWindows = isWindowsEnv();
  return (
    <Fragment>
      <EventHandling />
      <Layout
        hasSider={true}
        className={classNames('flatbiz-layout', {
          'flatbiz-layout-windows': isWindows,
        })}
      >
        {layoutCtx.siderBarMenus.length === 0 ||
        layoutCtx.hideSidebarMenu ? null : (
          <SiderBar />
        )}

        <Layout className="flatbiz-layout-main" hasSider={false}>
          {!layoutCtx.hideHeader ? <Header /> : null}
          {isIframeMain ? (
            <LayoutIFrame />
          ) : (
            <LayoutContent className={layoutCtx.layoutPageClassName}>
              <AppRoutes
                routeList={layoutCtx.routeList}
                breadExtendRender={layoutCtx.breadExtendRender}
                breads={layoutCtx.breads}
                hideDefaultBread={layoutCtx.hideDefaultBread}
                breadTitle={layoutCtx.breadTitle}
                // initSiderBarMenuActiveItem={props.initSiderBarMenuActiveItem}
                layoutMode={layoutCtx.layoutMode}
              />
            </LayoutContent>
          )}
        </Layout>
      </Layout>
    </Fragment>
  );
};
