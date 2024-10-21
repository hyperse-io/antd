import { Fragment } from 'react';
import { Layout } from 'antd';
import { classNames } from '@dimjs/utils';
import { isWindowsEnv } from '@hyperse/utils';
import { AppRoutes } from './app-routes.js';
import useAntdApp from './compts/antd-app/index.js';
import { Header } from './compts/header/index.js';
import { SiderBar } from './compts/sider-bar/index.js';
import { useLayoutCtx } from './context/layout-ctx.js';
import { EventHandling } from './layout/layout-iframe/event-handling/index.js';
import { LayoutIFrame } from './layout/layout-iframe/index.js';
import { LayoutPage } from './layout/layout-page/index.js';

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
        className={classNames('hyperse-layout', {
          'hyperse-layout-windows': isWindows,
        })}
      >
        {layoutCtx.siderBarMenus.length === 0 ||
        layoutCtx.hideSidebarMenu ? null : (
          <SiderBar />
        )}

        <Layout className="hyperse-layout-main" hasSider={false}>
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
