import { isArray } from '@dimjs/lang';
import { modifyQueryString, paramStrToJson, uriParse } from '@dimjs/utils';
import {
  ensureSlash,
  getGlobalData,
  isHttpUri,
  removeSlash,
  toArray,
  urlJoin,
  urlJoinMulti,
} from '@hyperse/utils';
import { TGlobalData, TMenuItem } from '../types/index.js';
import { sortItemsByPath } from './path.js';

/**
 * 找到第一个叶子节点
 * ```
 * tileMenuList： 通过treeToArray(treeList)
 * ```
 * @param tileMenuList 菜单平铺数据
 */
export const findOneLeafNode = (tileMenuList: TMenuItem[]) => {
  return tileMenuList.filter((item) => {
    return !item.children || item.children.length === 0;
  })[0];
};

/**
 * 查询 path 存在的菜单叶子节点
 * @param path
 * @param tileMenus 平铺菜单数据
 */
export const pathInLeafMenuList = (path: string, tileMenus: TMenuItem[]) => {
  path = getIframeTabPurePath(path);
  const sortedTileMenusByPath = sortItemsByPath<TMenuItem>(tileMenus);
  return sortedTileMenusByPath.find((item) => {
    if (isArray(item.children) && item.children.length > 0) return false;
    return ensureSlash(path, true).startsWith(
      ensureSlash(getIframeTabPurePath(item.path), true)
    );
  });
};

/**
 * 查询 path 存在的菜单节点（不考虑是否为叶子节点）
 */
export const pathInMenuList = (path: string, menus: TMenuItem[]) => {
  path = getIframeTabPurePath(path);
  return menus.find((item) => {
    return ensureSlash(path, true).startsWith(
      ensureSlash(getIframeTabPurePath(item.path), true)
    );
  });
};

/**
 * 猜测menu item link
 */
export const guessMenuLink = (path) => {
  const { routeBaseName, hostUrl } = getHostUrlAndRouteBaseName(path);
  return urlJoinMulti(hostUrl, routeBaseName, path);
};

/**
 * 获取 rotue path（不包含routeBaseName）
 * ```
 * 例如：
 * /pages/hyperse/demo-layout/main/system-set/menu1?env=me
 * routeBaseName = pages/hyperse/demo-layout
 * =>
 * /main/system-set/menu1
 * ```
 * @param path
 * @returns
 */
export const getPurePath = (path: string) => {
  const { routeBaseName } = getHostUrlAndRouteBaseName(path);
  return urlJoin('/', path)
    .replace(urlJoin('/', routeBaseName), '')
    .split('?')[0];
};

/**
 * 获取 iframe rotue path（不包含routeBaseName、main）
 * ```
 * 例如：
 * routeBaseName = pages/hyperse/demo-layout
 * 1. /pages/hyperse/demo-layout/main/system-set/menu1?env=me
 * 2. /main/system-set/menu1?env=me
 * 3. /system-set/menu1
 * =>
 * /system-set/menu1
 * ```
 * @param path
 * @returns
 */
export const getIframeTabPurePath = (pathOrUrl: string) => {
  const pathname = isHttpUri(pathOrUrl)
    ? (uriParse(pathOrUrl).pathname as string)
    : pathOrUrl;
  const { routeBaseName } = getHostUrlAndRouteBaseName(pathOrUrl);
  let purePath = urlJoin('/', pathname)
    .replace(urlJoinMulti('/', routeBaseName, '/'), '')
    .split('?')[0];
  purePath = urlJoinMulti('/', purePath, '/');
  if (purePath.startsWith('/main/')) {
    purePath = purePath.replace('/main/', '/');
  }
  return removeSlash(purePath, 'after');
};

export const getIframeMainPurePath = (pathOrUrl: string) => {
  const tabPurePath = getIframeTabPurePath(pathOrUrl);
  return urlJoin('/main', tabPurePath);
};

/**
 * 解析指定iframe main url数据
 * ```
 * 例如
 * http://dev.flatjs.com:6900/pages/hyperse/demo-iframe/main/module1/menu1?name=xxx
 * =>
 *  path: /main/module1/menu1
 *  search: ?name=xxx
 * ```
 * @param url
 */
export const parseIframeMainUrlInfo = (url: string) => {
  const purePath = getIframeMainPurePath(url);
  const uriParseValue = uriParse(url);
  const search = uriParseValue.search;
  return {
    path: purePath,
    search: search,
    pathSearch: `${purePath}${search || ''}`,
  };
};

/**
 * 解析指定iframe 内部 url数据
 * ```
 * 例如
 * http://dev.flatjs.com:6900/pages/hyperse/demo-iframe/main/module1/menu1?name=xxx
 * =>
 *  path: /module1/menu1
 *  search: ?name=xxx
 * ```
 * @param url
 */
export const parseIframeTabItemUrlInfo = (url: string) => {
  const purePath = getIframeTabPurePath(url);
  const uriParseValue = uriParse(url);
  const search = uriParseValue.search;
  return {
    path: purePath,
    search: search,
    pathSearch: `${purePath}${search || ''}`,
  };
};

export const pathStartWithPath = (path1: string, path2: string) => {
  return urlJoin(getIframeTabPurePath(path1), '/').startsWith(
    urlJoin(getIframeTabPurePath(path2), '/')
  );
};

/**
 * 猜测 iframe tab link
 * @param pathOrUrl
 *
 * ```
 * 例如1
 * routeBaseName = pages/hyperse/demo-layout
 * http://dev.flatjs.com/pages/hyperse/demo-iframe/main/module1/menu1?name=xxx
 * http://dev.flatjs.com/pages/hyperse/demo-iframe/module1/menu1?name=xxx
 * /main/module1/menu1?name=xxx
 * /module1/menu1?name=xxx
 * =>
 *  http://dev.flatjs.com/pages/hyperse/demo-iframe/module1/menu1?name=xxx
 * ```
 *
 * ```
 *  *****
 * 例如2
 * routeBaseName = pages/hyperse/demo-layout
 * http://dev.flatjs.com/pages/hyperse/demo-iframe/main/module1/menu1
 * http://dev.flatjs.com/pages/hyperse/demo-iframe/module1/menu1
 * /main/module1/menu1
 * /module1/menu1
 * =>
 *  http://dev.flatjs.com/pages/hyperse/demo-iframe/module1/menu1
 * ```
 */
export const guessIframeTabItemLink = (pathOrUrl: string) => {
  const { routeBaseName, hostUrl } = getHostUrlAndRouteBaseName(pathOrUrl);
  let pathSearch = '';
  if (isHttpUri(pathOrUrl)) {
    pathSearch = parseIframeTabItemUrlInfo(pathOrUrl).pathSearch;
  } else {
    const purePath = getIframeTabPurePath(pathOrUrl);
    const search = pathOrUrl.split('?')[1] || '';
    pathSearch = search ? `${purePath}?${search}` : purePath;
  }
  return urlJoinMulti(hostUrl, routeBaseName, pathSearch);
};

export const guessNormalItemLink = (pathOrUrl: string) => {
  const result = getHostUrlAndRouteBaseName(pathOrUrl);
  let routeBaseName = result.routeBaseName;
  pathOrUrl = removeSlash(pathOrUrl, 'before-after');
  routeBaseName = removeSlash(routeBaseName, 'before-after');
  if (!isHttpUri(pathOrUrl)) {
    if (pathOrUrl.startsWith(routeBaseName)) {
      return urlJoinMulti(result.hostUrl, pathOrUrl);
    }
    return urlJoinMulti(result.hostUrl, routeBaseName, pathOrUrl);
  }
  return pathOrUrl;
};

/**
 * 猜测 iframe main link
 * @param pathOrUrl
 *
 * ```
 * 例如1
 * routeBaseName = pages/hyperse/demo-layout
 * http://dev.flatjs.com/pages/hyperse/demo-iframe/main/module1/menu1?name=xxx
 * http://dev.flatjs.com/pages/hyperse/demo-iframe/module1/menu1?name=xxx
 * /main/module1/menu1?name=xxx
 * /module1/menu1?name=xxx
 * =>
 *  http://dev.flatjs.com/pages/hyperse/demo-iframe/main/module1/menu1?name=xxx
 * ```
 *
 * ```
 *  *****
 * 例如2
 * routeBaseName = pages/hyperse/demo-layout
 * http://dev.flatjs.com/pages/hyperse/demo-iframe/main/module1/menu1
 * http://dev.flatjs.com/pages/hyperse/demo-iframe/module1/menu1
 * /main/module1/menu1
 * /module1/menu1
 * =>
 *  http://dev.flatjs.com/pages/hyperse/demo-iframe/main/module1/menu1
 * ```
 */
export const guessIframeMainLink = (pathOrUrl: string) => {
  const { routeBaseName, hostUrl } = getHostUrlAndRouteBaseName(pathOrUrl);
  let pathSearch = '';
  if (isHttpUri(pathOrUrl)) {
    pathSearch = parseIframeMainUrlInfo(pathOrUrl).pathSearch;
  } else {
    const purePath = getIframeMainPurePath(pathOrUrl);
    const search = pathOrUrl.split('?')[1] || '';
    pathSearch = search ? `${purePath}?${search}` : purePath;
  }
  return urlJoinMulti(hostUrl, routeBaseName, pathSearch);
};

export const removeUrlProtocol = (url: string) => {
  const protocol = uriParse(url).protocol as string;
  return url.replace(protocol, '');
};

/**
 *  判断是否第三方链接
 * @param link
 * @returns
 */
export const judgeLinkIsThird = (link: string) => {
  // 此处不能使用 getHostUrlAndRouteBaseName
  const { routeBaseName, hostUrl, siblingProjectConfigs } =
    getGlobalData<TGlobalData>();
  const ruleBaseUrl = urlJoinMulti(hostUrl, routeBaseName, '/');
  const ruleBaseUrlNew = removeUrlProtocol(ruleBaseUrl);
  const linkNew = removeUrlProtocol(link);
  if (linkNew.startsWith(ruleBaseUrlNew)) {
    return false;
  }
  if (toArray(siblingProjectConfigs).length) {
    const target = siblingProjectConfigs?.find((item) => {
      const itemUrl = urlJoinMulti(item.hostUrl, item.routeBaseName, '/');
      const itemUrlNew = removeUrlProtocol(itemUrl);
      return linkNew.startsWith(itemUrlNew);
    });
    if (target) {
      return false;
    }
  }
  return true;
};

/**
 * 是否为iframe架构的其他项目
 * ```
 * 与 window.GLOBAL.siblingProjectConfigs 比较
 * ```
 */
export const judgeIframeSiblingProject = (link: string) => {
  const { routeBaseName, hostUrl, siblingProjectConfigs } =
    getGlobalData<TGlobalData>();
  const linkPath = getIframeTabPurePath(link);
  const ruleBaseUrl = urlJoinMulti(hostUrl, routeBaseName, '/');
  const ruleBaseUrlNew = removeUrlProtocol(ruleBaseUrl);
  const linkNew = removeUrlProtocol(link);
  if (!linkNew.startsWith(ruleBaseUrlNew)) {
    const target = getHostUrlAndRouteBaseName(link);
    if (target) {
      return {
        routeBaseName: target.routeBaseName,
        hostUrl: target.hostUrl,
        moduleUrl: target
          ? urlJoinMulti(target.hostUrl, target.routeBaseName, linkPath)
          : undefined,
      };
    }
    return undefined;
  }
  let projectTarget;
  let moduleTarget;
  siblingProjectConfigs?.forEach((item) => {
    item.modules?.forEach((temp) => {
      if (pathStartWithPath(link, temp.path) && !moduleTarget)
        moduleTarget = temp;
    });
    if (moduleTarget) projectTarget = item;
  });
  if (moduleTarget) {
    return {
      routeBaseName: projectTarget.routeBaseName,
      hostUrl: projectTarget.hostUrl,
      moduleUrl: urlJoinMulti(
        projectTarget.hostUrl,
        projectTarget.routeBaseName,
        moduleTarget.path
      ),
      name: moduleTarget.name,
    };
  }
  return undefined;
};

export const syncUrlSearch = (targetUrl: string, url: string) => {
  const searchJson = paramStrToJson(targetUrl);
  return modifyQueryString(url, searchJson);
};

export const getHostUrlAndRouteBaseName = (pathOrUrl: string) => {
  const { siblingProjectConfigs, routeBaseName, hostUrl } =
    getGlobalData<TGlobalData>();
  if (!isHttpUri(pathOrUrl)) {
    return { routeBaseName, hostUrl };
  }
  const link = pathOrUrl;
  const linkNew = removeUrlProtocol(link);
  if (toArray(siblingProjectConfigs).length) {
    const target = siblingProjectConfigs?.find((item) => {
      const itemUrl = urlJoinMulti(item.hostUrl, item.routeBaseName, '/');
      const itemUrlNew = removeUrlProtocol(itemUrl);
      return linkNew.startsWith(itemUrlNew);
    });
    if (target) {
      return { routeBaseName: target.routeBaseName, hostUrl: target.hostUrl };
    }
  }
  return { routeBaseName, hostUrl };
};
