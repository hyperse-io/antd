import { Fragment, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { theme } from 'antd';
import { isArray } from '@dimjs/lang';
import { extend, getQueryString } from '@dimjs/utils';
import { ConfigProviderWrapper, FbaApp } from '@hyperse/antd';
import {
  getGlobalData,
  isUndefinedOrNull,
  removeSlash,
  type TAny,
  toArray,
  urlJoin,
} from '@hyperse/utils';
import { AntdAppWrapper } from './antd-app';
import { AppNoLayout } from './app-no-layout';
import { AppProvider } from './app-provider';
import { ErrorBoundary, ErrorFallback } from './compts/error-boundary';
import { Container } from './container';
import { BootstrapCtx } from './context/layout-ctx';
import { IframeMainRegister } from './iframe-register';
import { proLayoutModels } from './model/layout-model';
import {
  type BreadConfigItem,
  RouteBreadConfig,
  TRouteItemProps,
} from './types';
import { type BootstrapOptions } from './types/layout';
import { type TGlobalData } from './types/menu';
import { getMenus, globalData } from './utils';

/**
 * ```
 * 1. 外部针对出现 iframe tab标题为未知页面的配置、或者想修改二级页面tab标题的，在main模块中设置
 * window['_iframeTabConfig'] = {
 *  '/system-get/menu3/detail': {
 *    name: '详情',
 *  },
 * };
 * 2. 在后续版本中会废弃`全局拦截model异常处理功能`，废弃ErrorHandling、onSessionExpired、verifySessionExpired三个属性的使用
 * ```
 */
export const Bootstrap = (options: BootstrapOptions) => {
  const [state] = proLayoutModels.useStore('ProLayoutModel');
  const isDark = state.isDark === undefined ? options.initDark : state.isDark;
  const globalValue = getGlobalData<TGlobalData>();
  const sidebarWidth = options.sidebarWidth || 220;
  const componentSize = options.componentSize || 'middle';
  const locale = options.locale;
  const logoPath = options.logoPath || '';

  const isIframeMain = options.layoutMode === 'iframe-main';
  const isIframeTabItem = options.layoutMode === 'iframe-tab';
  const headerThemeConfig: BootstrapOptions['headerThemeConfig'] = {
    bgColor: '#1890ff',
    textColor: '#fff',
    menuColor: '#fff',
    menuActiveTextColor: '#FFF',
    menuSelectedBgColor: '#0080e3',
    menuSelectedTextColor: '#FFF',
    menuTextFontSize: 14,
  };
  const sidebarThemeConfig: BootstrapOptions['sidebarThemeConfig'] = {
    bgColor: '#fff',
    menuActiveBgColor: 'rgba(0,0,0,0.06)',
    menuActiveTextColor: '#1890ff',
    menuSelectedBgColor: '#bae0ff',
    menuColor: 'rgba(0,0,0,.88)',
    menuSelectedTextColor: '#1890ff',
    menuSubMenuBgColor: 'rgba(0, 0, 0, 0.02)',
    inlineIndent: 16,
    menuItemHeight: 28,
    menuTextFontSize: 13,
  };

  const customHeaderThemeConfig =
    options.headerThemeConfig?.['dark'] || options.headerThemeConfig?.['light']
      ? options.headerThemeConfig?.[isDark ? 'dark' : 'light']
      : options.headerThemeConfig;

  const headerThemeConfigNew = extend(
    {},
    headerThemeConfig,
    customHeaderThemeConfig
  );
  const customSidebarThemeConfig =
    options.sidebarThemeConfig?.['dark'] ||
    options.sidebarThemeConfig?.['light']
      ? options.sidebarThemeConfig?.[isDark ? 'dark' : 'light']
      : options.sidebarThemeConfig;
  const sidebarThemeConfigNew = extend(
    {},
    sidebarThemeConfig,
    customSidebarThemeConfig
  );
  const iframeTabClickRefresh = isUndefinedOrNull(options.iframeTabClickRefresh)
    ? true
    : options.iframeTabClickRefresh;

  const { routeList, breadList } = useMemo(() => {
    const routeList = (() => {
      if (!globalData.moduleName) {
        console.error(
          '请在window.GLOBAL中添加属性moduleName（模块名称，例如：moduleName="system/admin"）'
        );
        return options.routeList;
      }
      const moduleName = removeSlash(globalData.moduleName, 'before-after');
      const routeListNew: TRouteItemProps[] = [];
      options.routeList.forEach((item) => {
        const path = removeSlash(item.path, 'before-after');
        const redirect = removeSlash(item.redirect || '', 'before-after');
        if (redirect) {
          item.redirect = redirect.startsWith(moduleName)
            ? item.redirect
            : `/${urlJoin(moduleName, item.redirect || '')}`;
        }
        if (item.path === '/' || path === '') {
          routeListNew.push({
            ...item,
            path: `/${urlJoin(moduleName, item.path)}`,
          });
        } else if (path === '*') {
          routeListNew.push({ ...item, path: `/*` });
        } else if (!path.startsWith(moduleName)) {
          routeListNew.push({
            ...item,
            path: `/${urlJoin(moduleName, item.path)}`,
          });
        } else {
          routeListNew.push(item);
        }
      });
      return routeListNew;
    })();

    const breadList: BreadConfigItem[] = [];
    routeList.forEach((item) => {
      if (item.breadConfig) {
        if (typeof item.breadConfig === 'string') {
          breadList.push({
            path: item.path,
            breadConfig: { name: item.breadConfig },
          });
          return;
        }

        if (isArray(item.breadConfig)) {
          const dataList = item.breadConfig as {
            path: string;
            breadConfig: string | RouteBreadConfig;
          }[];
          dataList.forEach((innItem) => {
            const mergePath = removeSlash(
              urlJoin(item.path, innItem.path)
                .replace('/*', '')
                .replace('*', ''),
              'before-after'
            );
            if (typeof innItem.breadConfig === 'string') {
              breadList.push({
                path: `/${mergePath}`,
                breadConfig: { name: innItem.breadConfig },
              });
              return;
            }
            breadList.push({
              path: `/${mergePath}`,
              breadConfig: innItem.breadConfig,
            });
          });
          return;
        }
        breadList.push({
          path: item.path,
          breadConfig: item.breadConfig as any,
        });
      }
    });

    if (getQueryString('debug')) {
      console.log('bootstrap routeList original', options.routeList);
      console.log('bootstrap routeList', routeList);
      console.log('bootstrap breadList', breadList);
    }
    return { routeList, breadList };
  }, [options.routeList]);

  const { menus, completeMenus } = getMenus(
    isIframeMain || isIframeTabItem,
    options.siderBarMaxMenuLevel,
    options.disableTopbarMenu
  );

  const appProviderValue = {
    ...options,
    sidebarWidth,
    componentSize,
    locale,
    routeList,
    breads: breadList,
    logoPath,
    headerThemeConfig: headerThemeConfigNew,
    sidebarThemeConfig: sidebarThemeConfigNew,
    iframeTabClickRefresh,
    headerHeight:
      options.headerHeight === undefined ? 64 : options.headerHeight,
    menus,
    completeMenus,
    dark: isDark,
  };

  // const root = createRoot(document.getElementById('app') as HTMLElement);
  const layoutMode = appProviderValue.layoutMode;
  const isNoLayout = ['no-layout', 'iframe-tab'].includes(layoutMode);
  const ContainerWrapper = options.containerWrapper || Fragment;

  const configProviderProps = useMemo(() => {
    const algorithm = options.configProviderProps?.theme?.algorithm;

    let algorithmArray = toArray<TAny>(algorithm);

    algorithmArray = [
      ...algorithmArray,
      isDark ? theme.darkAlgorithm : null,
      options.compact ? theme.compactAlgorithm : null,
    ].filter(Boolean);
    return {
      ...options.configProviderProps,
      theme: {
        ...options.configProviderProps?.theme,
        algorithm: algorithmArray,
      },
    };
  }, [isDark, options.compact, options.configProviderProps]);

  return (
    <ConfigProviderWrapper
      locale={locale as TAny}
      componentSize={componentSize}
      space={{ size: componentSize }}
      {...configProviderProps}
    >
      <ContainerWrapper>
        <BrowserRouter basename={globalValue.routeBaseName}>
          <BootstrapCtx
            value={{
              breads: breadList,
              breadTitle: appProviderValue.breadTitle,
              breadcrumbProps: appProviderValue.breadcrumbProps,
            }}
          >
            <AntdAppWrapper appProviderValue={appProviderValue}>
              <FbaApp>
                <ErrorBoundary
                  onError={options.onError}
                  onReset={options.onErrorReset}
                  FallbackComponent={options.ErrorFallback || ErrorFallback}
                >
                  {layoutMode === 'iframe-main' ? <IframeMainRegister /> : null}
                  <Container
                    layoutMode={appProviderValue.layoutMode}
                    MenuEmptyRender={appProviderValue.MenuEmptyRender}
                    menus={menus}
                    ignoreMenuEmptyJudge={appProviderValue.ignoreMenuEmptyJudge}
                  >
                    {isNoLayout ? (
                      <AppNoLayout
                        verifySessionExpired={
                          appProviderValue.verifySessionExpired
                        }
                        routeList={routeList}
                        layoutMode={layoutMode}
                        LayoutComponent={appProviderValue.LayoutComponent}
                        breadExtendRender={appProviderValue.breadExtendRender}
                        breads={appProviderValue.breads}
                        hideDefaultBread={appProviderValue.hideDefaultBread}
                        hideHeader={appProviderValue.hideHeader}
                        breadTitle={appProviderValue.breadTitle}
                        disableErrorHandling={
                          appProviderValue.disableErrorHandling
                        }
                        ErrorHandling={appProviderValue.ErrorHandling}
                        iframeTabAloneView={appProviderValue.iframeTabAloneView}
                        layoutPageClassName={
                          appProviderValue.layoutPageClassName
                        }
                      />
                    ) : (
                      <AppProvider {...appProviderValue} />
                    )}
                  </Container>
                </ErrorBoundary>
              </FbaApp>
            </AntdAppWrapper>
          </BootstrapCtx>
        </BrowserRouter>
      </ContainerWrapper>
    </ConfigProviderWrapper>
  );
};
