import {
  type ComponentType,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { type BreadcrumbProps, type MenuProps } from 'antd';
import { type SizeType } from 'antd/lib/config-provider/SizeContext.js';
import { type ConfigProviderWrapperProps } from '@hyperse/antd';
import { type FallbackProps } from '../compts/error-boundary/index.js';
import {
  type IframeTabItem,
  type TAdminUser,
  type TGlobalData,
  type TMenuItem,
} from './menu.js';
import { type BreadConfigItem, type TRouteItemProps } from './route.js';

type TSidebarThemeConfig = {
  bgColor?: string;
  menuActiveBgColor?: string;
  menuActiveTextColor?: string;
  menuSelectedBgColor?: string;
  menuSelectedTextColor?: string;
  menuColor?: string;
  menuSubMenuBgColor?: string;
  menuTextFontSize?: number;
  menuItemHeight?: number;
  /** 默认值 16 */
  inlineIndent?: number;
};

type THeaderThemeConfig = {
  bgColor?: string;
  textColor?: string;
  menuActiveBgColor?: string;
  menuActiveTextColor?: string;
  menuSelectedBgColor?: string;
  menuSelectedTextColor?: string;
  menuColor?: string;
  menuTextFontSize?: number;
};

/**
 * url地址上配置 hideBreads = 1，可隐藏面包屑显示
 */
export type BootstrapOptions = {
  className?: string;
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 初始化是否为dark模式 */
  initDark?: boolean;
  /**
   * ```
   * 1. 正常用法
   * [
   *  { path: '/', element: <Home /> },
   *  { path: '/detail', element: <Detail />}
   * ]
   *
   * 2. 懒加载用法
   * [{
   *   path: '/',
   *   element: lazy(() => import(\/* webpackChunkName: "xxx/xxx/module/chunks/home" *\/ './home')),
   * },{
   *   path: '/detail',
   *   element: lazy(() => import(\/* webpackChunkName: "xxx/xxx/module/chunks/detail" *\/ './detail')),
   * }]
   *
   * 3. 如果配置中没有path = '*' 或者 '/*'，程序会在路由中添加 <Route path="*" element={<NotFound />} />，可自定义配置处理404页面
   * 4. 如果GLOBAL中没有返回moduleName字段，path则需要添加moduleName前缀，例如: moduleName=/system/admin，则path = '/system/admin/xxx'
   * 5. 有问题可联系xg15472
   * ```
   */
  routeList: TRouteItemProps[];
  /**
   * layout模式
   * ```
   * 1. no-layout 无结构，常用于登录页面
   * 2. iframe-main iframe main页面
   * 3. iframe-tab iframe tab页面
   * 4. normal 普通路由&刷新页面
   * ```
   */
  layoutMode: 'iframe-main' | 'iframe-tab' | 'normal' | 'no-layout';
  /**
   * 是否设置iframe多tab模式，layoutMode = 'iframe-main' 有效
   * ```
   * iframe-main 有两种渲染模式
   * 1.单iframe tab模式
   * 2.多iframe tab模式
   * ```
   */
  multiFrameTabs?: boolean;
  /**
   * 是否禁用顶部菜单
   */
  disableTopbarMenu?: boolean;
  /**
   * 设置iframe模式TabBarExtra
   * ```
   * 1. 赋值后，默认的刷新、删除Dropdown将被取消
   * ```
   */
  iframeTabBarExtra?: JSX.Element;
  /**
   * 品牌logo尺寸：40px * ?（?不超过64）
   */
  logoPath?: string;
  /**
   * 品牌名称
   */
  brandName?: string | JSX.Element;
  /**
   * 系统名称
   */
  systemName?: string;
  /**
   * 是否隐藏头部，默认值false
   */
  hideHeader?: boolean;
  /**
   * 顶部结构高度。默认：64
   */
  headerHeight?: number;
  /**
   * @default 220
   */
  sidebarWidth?: number;
  /**
   * @default zhCN
   */
  locale?: 'en' | 'zh-cn';
  /**
   * iframe模式顶部菜单点击操作类型，
   * 1. refresh 刷新
   * 2. route 路由切换
   */
  iframeTopbarMenuClickType?: 'refresh' | 'route';
  /** ANTD 默认的组建尺寸，默认值：middle */
  componentSize?: SizeType;
  // Footer?: (() => JSX.Element) | null;
  /** header区域添加自定义功能 */
  Header?: (() => JSX.Element) | null;
  /** 自定义左上角品牌区域 */
  HeaderBrand?: (() => JSX.Element) | null;
  /**
   * layout内容区组件
   *```
   * layoutMode = 'iframe-main' 此配置无效
   * layoutMode = 'iframe-tab' or 'normal'时，默认值为LayoutPage
   * ```
   */
  LayoutComponent?: ComponentType<{
    style?: CSSProperties;
    hideHeader?: boolean;
  }>;

  /** 点击右上角默认退出登录操作 */
  onSignOut?: (user: TAdminUser, hostUrl: string) => void;
  /**
   * 设置有右上角操作选项
   * ```
   * [
      {
        label: '退出登录',
        key: '0',
        onClick: async () => {
         //
        },
        icon: <LogoutOutlined />,
      },
      {
        label: '自定义操作',
        key: '1',
        onClick: () => {
         //
        },
        icon: <PieChartOutlined />,
      },
    ]
   * ```
   */
  accountOperateMenuItems?: MenuProps['items'];

  /** 面包屑起始标题 */
  breadTitle?: string | ReactElement;
  /** 面包屑位置功能扩展 */
  breadExtendRender?: ReactElement;
  /**  隐藏默认设置的面包屑，默认值false */
  hideDefaultBread?: boolean;

  /** 设置全局 antd ConfigProvider */
  configProviderProps?: ConfigProviderWrapperProps;
  /**
   * 配置theme后 sidebarThemeConfig 配置失效
   */
  sidebarMenuConfigProviderProps?: ConfigProviderWrapperProps;
  /**
   * 配置theme后 headerThemeConfig 配置失效
   */
  topMenuConfigProviderProps?: ConfigProviderWrapperProps;
  /** 自定义header颜色 */
  headerThemeConfig?:
    | THeaderThemeConfig
    | { dark?: THeaderThemeConfig; light?: THeaderThemeConfig };

  /** 自定义侧边栏菜单颜色 */
  sidebarThemeConfig?:
    | TSidebarThemeConfig
    | { dark?: TSidebarThemeConfig; light?: TSidebarThemeConfig };
  /** 是否显示顶部菜单中收缩按键 */
  showTopMenuShrink?: boolean;
  /** 是否隐藏侧边栏中收缩按键 */
  hideSidebarShrink?: boolean;
  /** 初始化侧边栏为收起状态 */
  initSidebarShrinkClosed?: boolean;
  /** 收缩按键onChange */
  onShrinkChange?: (status: 'open' | 'close') => void;
  /**
   * 开启侧边栏鼠标悬浮打开、收起功能，一般与initSidebarShrinkClosed配合使用最佳
   * ```
   * 1. 鼠标悬浮侧边栏菜单打开
   * 2. 鼠标离开侧边栏菜单收起
   * 3. 手动点击打开侧边栏菜单，悬浮功能失效
   * 4. 手动点击收起侧边栏菜单，悬浮功能生效
   * ```
   */
  sidebarMouseHoverOpen?: boolean;

  /**
   * iframe tab点击是有刷新效果，默认：true
   */
  iframeTabClickRefresh?: boolean;
  /**
   * 能匹配到菜单的情况下，是否隐藏菜单
   * ```
   * 1. disableTopbarMenu = true，该配置无效（无顶部菜单，侧边栏菜单不能隐藏）
   * 2. 不能通过这个属性来控制【未配置到菜单隐藏侧边栏逻辑】
   *
   * 注意：隐藏侧边栏分为两种
   * 1. 能匹配到菜单的情况下，需要隐藏菜单
   * 2. 匹配不到菜单的情况下，隐藏
   * ```
   */
  hideSidebarMenu?: boolean | (() => boolean);
  /**
   * 未配置到菜单情况下，是否隐藏侧边栏开关, 默认值 true/隐藏
   * ```
   * disableTopbarMenu = true，该配置无效（无顶部菜单，侧边栏菜单不能隐藏）
   * ```
   */
  unMatchHiddenSiderBar?: boolean;
  /** 收缩后侧边栏宽度，默认：80 */
  collapsedWidth?: number;
  /** 侧边栏是否显示搜索框 */
  sliderBarSearch?: boolean;
  /** iframeTab 页面可独立访问 */
  iframeTabAloneView?: boolean;
  /**
   * ConfigProviderWrapper 内包裹层，可实现业务包裹层功能
   */
  containerWrapper?: ComponentType<{
    children: ReactElement;
  }>;
  /**
   * 自定义用户名称，当前使用的是GLOBAL.user.userName字段
   */
  onCustomUserName?: (global: TGlobalData) => string | ReactElement;
  /**
   * 自定义用户头像，当前使用的是GLOBAL.user.avatar字段
   */
  onCustomUserAvatar?: (global: TGlobalData) => string | ReactElement;
  /**
   * 显示header bar菜单icon，默认不显示
   */
  showHeaderMenuIcon?: boolean;
  /**
   * 基本颜色配置
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
  /** 菜单为空渲染，默认：请联系运营人员确定菜单数据配置 */
  MenuEmptyRender?: ReactElement;
  /** 忽略菜单为空的判断 */
  ignoreMenuEmptyJudge?: boolean;

  /** 初始化ErrorBoundary自定义异常渲染 */
  ErrorFallback?: ComponentType<FallbackProps>;
  /** 初始化ErrorBoundary异常回调 */
  onError?: (error: Error, info: { componentStack: string }) => void;
  /** 初始化ErrorBoundary异常重置回调 */
  onErrorReset?: (...args) => void;
  /**
   * model全局异常服务拦截，是否禁用全局异常处理
   * @deprecated 已过期，判断业务中是否使用了model的全局异常拦截功能，如果没有使用可删除
   */
  disableErrorHandling?: boolean;
  /**
   * model全局异常服务拦截，自定义ErrorHandling
   * @deprecated 已过期，判断业务中是否使用了model的全局异常拦截功能，如果没有使用可删除
   */
  ErrorHandling?: (() => JSX.Element) | null;
  /**
   * model全局异常服务拦截，session 失效处理
   * @deprecated 已过期，判断业务中是否使用了model的全局异常拦截功能，如果没有使用可删除
   */
  onSessionExpired?: (user: TAdminUser, hostUrl: string) => void;
  /**
   * model全局异常服务拦截，判断是否session失效，返回true则失效
   * @deprecated 已过期，判断业务中是否使用了model的全局异常拦截功能，如果没有使用可删除
   */
  verifySessionExpired?: (err) => boolean;
  /**
   * sidebar菜单层级限制，层级以外的一级菜单会显示在内容区顶部
   * ```
   * 1. layoutMode = iframe-main &&  multiFrameTabs = false 有效
   * 2. 效果可参考新版本find系统
   * ```
   */
  siderBarMaxMenuLevel?: number;
  /** 侧边栏一级菜单是否可以多个打开，默认值: true */
  siderBarFirstMenuFoldMultipleOpen?: boolean;
  /** 面包屑配置 */
  breadcrumbProps?: Pick<BreadcrumbProps, 'separator' | 'className'>;
  /** LayoutPage className属性 */
  layoutPageClassName?: string;
  /** 取消iframe中路由地址同步至外部父窗口，在 iframe-main 中配置有效 */
  cancelIframeRouteSyncParent?: boolean;
  /** 侧边栏菜单onChange事件 */
  siderBarMenuOnChange?: (data) => void;
};
export type LayoutCtxProps = {
  menus: TMenuItem[];
  completeMenus: TMenuItem[];
  siderBarMenus: TMenuItem[];
  /** 平铺数组  */
  siderBarTileMenus: TMenuItem[];
  siderBarMenuActiveItem?: TMenuItem;
  topMenuActiveItem?: TMenuItem;
  iframeTabList: IframeTabItem[];
  iframeTabActiveItem: IframeTabItem;
  sidebarWidth: number;
  componentSize: SizeType;
  routeList: TRouteItemProps[];
  breads: BreadConfigItem[];
  collapsed: boolean;
  onChangeCollapsed: (boo: boolean) => void;
  selectedKeys: string[];
  opendKeys: string[];
  onChangeSelectedKeys: (selectedKeys: string[]) => void;
  onChangeOpendKeys: (opendKeys: string[]) => void;
  addOrUpdateIframeTab: (item: TMenuItem) => void;
  onIframeChange: (
    id: string,
    type: 'menuClick' | 'iframeTabClick' | 'iframeRefresh',
    options?: {
      // 是否定位菜单，type=menuClick 有效
      locationMenu?: boolean;
    }
  ) => void;
  onDeleteIframeTabItem: (
    type: 'other' | 'otherAll' | 'all' | 'me',
    id?: string
  ) => void;
  onIframeChangeByHttpUrl: (
    url: string,
    options?: { name?: string; metaTitle?: string }
  ) => void;
  onUpdateIframeTabName: (name: string) => void;
  normalModePositionMenu: (link: string) => void;
  iframeTopRouteMenuChange: (item: TMenuItem) => void;
  hideSidebarMenu?: boolean;
  /** 关闭当前iframe tab并打开指定iframe tab */
  onDeleteCurrentIframeTabItemOpenTargetIframeTab: (
    id: string | number,
    menuId?: string | number
  ) => void;
  /** 通过新iframe tab打开第三方菜单页面 */
  onOpenNewIframeThirdMenuItem: (data: {
    menuItem: TMenuItem;
    link: string;
    name: string;
  }) => void;
  headerThemeConfig?: THeaderThemeConfig;
  sidebarThemeConfig?: TSidebarThemeConfig;
} & Omit<
  BootstrapOptions,
  | 'sidebarWidth'
  | 'componentSize'
  | 'locale'
  | 'hideSidebarMenu'
  | 'headerThemeConfig'
  | 'sidebarThemeConfig'
>;

export interface LeaveMenuProps {
  leaveMenus?: TMenuItem[];
  selectedKeys?: string[];
}
