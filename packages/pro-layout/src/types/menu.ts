export type TMenuItem = {
  id: string | number;
  name: string;
  path: string;
  link: string;
  target?: '_blank' | '_self';
  metaTitle?: string;
  /**
   * iconImg&iconImgActive为自定义png图标
   */
  iconImg?: string;
  icon?: string;
  iconImgActive?: string;
  defaultPage?: string;
  parentId: null | number | string;
  children: TMenuItem[];
  key?: string;
};

export type TGlobalData = {
  appName: string;
  user: TAdminUser;
  menus: TMenuItem[];
  apiBase: string;
  hostUrl: string;
  defaultPage?: string;
  routeBaseName: string;
  elemAclLimits: string[];
  moduleName?: string;
  siblingProjectConfigs?: {
    routeBaseName: string;
    hostUrl: string;
    modules: { path: string; name: string }[];
  }[];
};

export type TAdminUser = null | {
  id: string;
  userName: string;
  avatar?: string;
};

export type IframeTabItem = {
  id: string | number;
  link: string;
  name: string;
  metaTitle?: string;
  iframeKey: string;
  menuId?: string;
  pathSearch: string;
};
