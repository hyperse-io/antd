import { isArray, isPlainObject } from '@dimjs/lang';
import { cloneState } from '@dimjs/model';
import { findAncestors, getEnvName, modifyQueryString } from '@dimjs/utils';
import {
  getUuid,
  isHttpUri,
  removeSlash,
  sessionStorageCache,
  type TAny,
  toArray,
  toLinkPath,
  type TPlainObject,
  treeToArray,
  urlJoin,
  valueIsEqual,
} from '@hyperse/utils';
import { type IframeTabItem, type TMenuItem } from '../types/menu.js';
import { pathIncludePath, sortItemsByPath } from './path.js';
import { globalData } from './system.js';
import {
  getIframeTabPurePath,
  guessIframeTabItemLink,
  guessNormalItemLink,
  judgeIframeSiblingProject,
  judgeLinkIsThird,
  parseIframeMainUrlInfo,
  parseIframeTabItemUrlInfo,
  syncUrlSearch,
} from './utils.js';

const appName = globalData.appName || 'hyperse-layout';

function removeNodesAtDepth(tree, depth: number, maxDepth: number) {
  for (let i = tree.length - 1; i >= 0; i--) {
    const node = tree[i];
    if (node.children && depth <= maxDepth) {
      node.children = removeNodesAtDepth(node.children, depth + 1, maxDepth);
    }
    if (depth === maxDepth + 1) {
      tree.splice(i, 1);
    }
  }
  return tree;
}

/**
 * 处理不合规 menus 数据
 * @param isIframeType
 * @returns
 */
export const getMenus = (
  isIframeType?: boolean,
  siderBarMaxMenuLevel?: number,
  disableTopbarMenu?: boolean
) => {
  const menus = (globalData.menus || []) as TAny[];
  treeToArray(menus, 'children').forEach((item) => {
    if (isPlainObject(item.link)) {
      item.link = item.link?.[getEnvName()] || item.link?.['prod'];
    }
    const path = `/${removeSlash(item.path, 'before-after')}`;
    const routeBaseName = removeSlash(globalData.routeBaseName, 'before-after');
    /**
     * path 处理
     */
    if (isIframeType) {
      if (path.startsWith(`/${routeBaseName}/main`)) {
        item.path = path.replace(`/${routeBaseName}`, '');
      } else if (!path.startsWith('/main')) {
        item.path = `/main${path}`;
      }
    } else {
      if (path.startsWith(`/${routeBaseName}`)) {
        item.path = path.replace(`/${routeBaseName}`, '');
      }
    }
    if (!item.children?.length || !!siderBarMaxMenuLevel) {
      if (isIframeType) {
        if (!item.link) {
          item.link = guessIframeTabItemLink(item.path);
        } else if (!isHttpUri(item.link)) {
          // 解决link不完整，以及link中包含/main
          item.link = guessIframeTabItemLink(item.link);
        }
      } else {
        if (item.link && !isHttpUri(item.link)) {
          // 解决link不完整
          item.link = guessNormalItemLink(item.link);
        }
      }
    }
  });

  if (siderBarMaxMenuLevel) {
    const maxDepth = !disableTopbarMenu
      ? siderBarMaxMenuLevel + 1
      : siderBarMaxMenuLevel;
    const newTreeList = removeNodesAtDepth(cloneState(menus), 1, maxDepth);
    console.log('menus', menus, newTreeList);
    return {
      menus: newTreeList as unknown as TMenuItem[],
      completeMenus: menus as unknown as TMenuItem[],
    };
  }

  return {
    menus: menus as unknown as TMenuItem[],
    completeMenus: menus as unknown as TMenuItem[],
  };
};

/**
 * 连接是否相同
 * 1. 删除连接上的env后比较
 * @param link1
 * @param link
 */
export const linkEqual = (link1: string, link2: string) => {
  const link1New = modifyQueryString(link1, { env: undefined });
  const link2New = modifyQueryString(link2, { env: undefined });
  return link1New === link2New;
};

export const findFirstLeafNode = (target: TMenuItem) => {
  const _findFirstNodeTarget = function (itemList: TMenuItem[]) {
    if (isArray(itemList[0]?.children) && itemList[0].children.length > 0) {
      return _findFirstNodeTarget(itemList[0].children || []);
    }
    return itemList[0];
  };
  if (target.children && target.children.length > 0) {
    return _findFirstNodeTarget(target.children);
  }
  return target;
};

/**
 * 根据 path，定位侧边栏目标菜单
 * @param tileMenus
 * @param path
 * @returns
 */
export const parseSiderTargetMenuByPath = (
  tileMenus: TMenuItem[],
  link: string
) => {
  const path = getIframeTabPurePath(link);
  if (['', '/'].includes(path)) {
    return findFirstLeafNode(tileMenus[0]);
  }
  const sortedTileMenusByPath = sortItemsByPath<TMenuItem>(tileMenus);
  const target = sortedTileMenusByPath.find((item) => {
    return pathIncludePath(path, getIframeTabPurePath(item.path));
  });
  if (
    target?.children &&
    isArray(target?.children) &&
    target.children.length > 0
  ) {
    // 找到 第一个叶子节点
    const leafNode = findFirstLeafNode(target);
    /**
     * 1. 可以匹配
     * location: system/idx
     * leafNode: system/idx/list
     * 2. 不可匹配
     * location: system/idx/xxx
     * leafNode: system/idx/list
     */
    if (!pathIncludePath(getIframeTabPurePath(leafNode.path), path))
      return undefined;

    return leafNode;
  }
  return target;
};

/**
 * 根据 path，定位一级目标菜单
 */
export const parseFirstMenuByPath = (menus: TMenuItem[], link: string) => {
  const path = getIframeTabPurePath(link);
  const sortedMenus = sortItemsByPath<TMenuItem>(menus);
  const target = sortedMenus.find((item) => {
    return pathIncludePath(path, getIframeTabPurePath(item.path));
  });
  return target;
};

// 获取目标菜单父级链路
export const getTargetMenuParentChain = (
  menuId: string | number,
  siderBarMenus: TMenuItem[]
) => {
  const result = findAncestors(siderBarMenus, (item: TMenuItem) =>
    valueIsEqual(item.id, menuId)
  );
  const chainMenuIdList: string[] = [];
  result.forEach((item) => chainMenuIdList.push(`${item.id}`));
  return chainMenuIdList;
};

export const saveIframeTabToCache = (menuList: IframeTabItem[]) => {
  const newList = isArray(menuList) ? menuList : [];
  (window as any)[appName] = newList;
  sessionStorageCache.set(appName, { menuList: newList });
};

export const getIframeTabCacheList = (): IframeTabItem[] => {
  try {
    if (window[appName]) return [...(window as any)[appName]];
    const { menuList } = sessionStorageCache.get(appName) || {};
    const newList = isArray(menuList) ? (menuList as IframeTabItem[]) : [];
    (window as any)[appName] = newList;
    return newList;
  } catch (_error) {
    return [];
  }
};

export const saveCacheIframeActiveItem = (item: TPlainObject) => {
  window[`${appName}-iframeActiveItem`] = item;
  sessionStorageCache.set(`${appName}-iframeActiveItem`, { ...item });
};

export const getCacheIframeActiveItem = (): IframeTabItem | undefined => {
  if (getIframeTabCacheList().length === 0) return undefined;
  try {
    if (window[`${appName}-iframeActiveItem`])
      return window[`${appName}-iframeActiveItem`] as IframeTabItem;
    const activeItem = sessionStorageCache.get(
      `${appName}-iframeActiveItem`
    ) as IframeTabItem;
    const item = activeItem && activeItem.id ? activeItem : undefined;
    window[`${appName}-iframeActiveItem`] = item;
    return item as IframeTabItem;
  } catch (_error) {
    return undefined;
  }
};

/**
 * 更新 or 保存 iframeList
 * @param item
 * @param iframeTabList
 */
export const addOrUpdateIframeTabListByMenuItem = (
  item: TMenuItem,
  iframeTabList: IframeTabItem[]
) => {
  const targetLink = item.link;
  /**
   * 1. iframeTabList中link 与 targetLink是否完全相同
   */
  const target = iframeTabList.find((item) => linkEqual(item.link, targetLink));
  if (target) {
    return {
      iframeTabListNew: iframeTabList,
      iframeTabActiveItem: target,
    };
  }
  return addIframeTabListByMenuItem(iframeTabList, item);
};

export const addIframeTabListByMenuItem = (
  iframeTabList: IframeTabItem[],
  item: TMenuItem
) => {
  let pathSearch: string;
  const siderbarMenuLinkIsThird = judgeLinkIsThird(item.link);
  if (siderbarMenuLinkIsThird) {
    pathSearch = item.path;
  } else {
    pathSearch = parseIframeMainUrlInfo(toLinkPath(item.link)).pathSearch;
  }
  const newItem = {
    id: getUuid(),
    link: toLinkPath(item.link),
    name: item.name,
    metaTitle: item.metaTitle,
    iframeKey: `${Date.now()}`,
    menuId: item.id ? `${item.id}` : undefined,
    pathSearch,
  };
  const newList = iframeTabList.concat(newItem);
  return {
    iframeTabListNew: newList,
    iframeTabActiveItem: newItem,
  };
};

export const clearStorage = () => {
  sessionStorageCache.remove(appName);
  // sessionStorageCache.remove(`${appName}-iframeActiveItem`);
};

/**
 * 判断目标 link 是否为 菜单叶子节点
 * @param targetLink
 * @param siderBarTileMenus
 * @returns
 */
const judgeTargetLinkIsLeafNodeMenu = (
  targetLink: string,
  siderBarTileMenus: TMenuItem[]
) => {
  const sortedTileMenusByPath = sortItemsByPath<TMenuItem>(siderBarTileMenus);
  const targetPath = getIframeTabPurePath(targetLink);
  const target = sortedTileMenusByPath.find((item) => {
    return pathIncludePath(targetPath, getIframeTabPurePath(item.path));
  });
  return target ? toArray(target?.children).length === 0 : false;
};

/**
 * 初始化根据当前 location 定位 iframe tab
 * ```
 * ```
 * @param siderBarTileMenus 侧边栏平铺菜单列表
 * @param siderbarTargetMenu 侧边栏激活菜单
 * @returns
 */
export const initSyncIframeTabCacheByLocation = (
  siderBarTileMenus: TMenuItem[],
  siderbarTargetMenu?: TMenuItem
) => {
  const iframeTabCacheList = getIframeTabCacheList();
  // iframe 激活 tab
  const iframeTabActiveItem: IframeTabItem | undefined =
    getCacheIframeActiveItem();
  if (siderbarTargetMenu) {
    const locationIsLeafNode = judgeTargetLinkIsLeafNodeMenu(
      location.href,
      siderBarTileMenus
    );
    // 是否外部第三方链接
    const siderbarMenuLinkIsThird = judgeLinkIsThird(siderbarTargetMenu.link);
    const siderbarMenuLinkIsExternal = judgeIframeSiblingProject(
      siderbarTargetMenu.link
    );

    /**
     * 1. 如果 location.href 为叶子节点，可指定为 待渲染link（location.href与siderbarTargetMenu.link参数可能不同）
     * 2. 如果 location.href 不是叶子节点，可能存在链接不完整，则指定 siderbarTargetMenu.link 为 待渲染link
     */
    let waitRenderLink: string;
    let waitRenderLinkPathSearch: string;

    if (siderbarMenuLinkIsThird) {
      waitRenderLink = syncUrlSearch(location.href, siderbarTargetMenu.link);
      waitRenderLinkPathSearch = parseIframeMainUrlInfo(
        location.href
      ).pathSearch;
    } else if (siderbarMenuLinkIsExternal) {
      // 取出当前
      const locationPathSearch = parseIframeTabItemUrlInfo(
        location.href
      ).pathSearch;
      const siderbarTarget = parseIframeTabItemUrlInfo(
        siderbarTargetMenu.link
      ).pathSearch;
      if (locationPathSearch) {
        waitRenderLink = toLinkPath(
          siderbarTargetMenu.link.replace(siderbarTarget, locationPathSearch)
        );
      } else {
        waitRenderLink = toLinkPath(siderbarTargetMenu.link);
      }
      waitRenderLinkPathSearch =
        parseIframeMainUrlInfo(waitRenderLink).pathSearch;
    } else {
      waitRenderLink = guessIframeTabItemLink(
        toLinkPath(locationIsLeafNode ? location.href : siderbarTargetMenu.link)
      );
      waitRenderLinkPathSearch =
        parseIframeMainUrlInfo(waitRenderLink).pathSearch;
    }

    if (iframeTabActiveItem) {
      const iframeTabActiveLink = iframeTabActiveItem.link;
      /**
       * 如果  waitRenderLink 与 iframeTabActiveLink 完全相同
       */
      if (linkEqual(waitRenderLink, iframeTabActiveLink)) {
        const result = {
          // name: tabName,
          menuId: siderbarTargetMenu.id as string,
          link: waitRenderLink,
          pathSearch: waitRenderLinkPathSearch,
        };
        updateCaheIframeListByActiveId(
          iframeTabActiveItem.id as string,
          result
        );
        return { ...iframeTabActiveItem, ...result };
      }

      const path1 = getIframeTabPurePath(location.href);
      const path2 = getIframeTabPurePath(iframeTabActiveLink);
      if (path1 === path2) {
        updateCaheIframeListByActiveId(iframeTabActiveItem.id as string, {
          link: waitRenderLink,
          pathSearch: waitRenderLinkPathSearch,
        });
        return {
          ...iframeTabActiveItem,
          link: waitRenderLink,
          pathSearch: waitRenderLinkPathSearch,
        };
      }
      /**
       * location.href 与 iframeTabActive link 没有关系，则覆盖当前iframe tab
       */
      const link = siderbarMenuLinkIsExternal
        ? syncUrlSearch(location.href, siderbarTargetMenu.link)
        : waitRenderLink;
      const newItem = {
        link,
        name: getIframeTabName(waitRenderLink, siderbarTargetMenu.name),
        metaTitle: siderbarTargetMenu.metaTitle,
        id: getUuid(),
        iframeKey: `${Date.now()}`,
        menuId: `${siderbarTargetMenu.id}`,
        pathSearch: waitRenderLinkPathSearch,
      };
      // 覆盖 当前 iframe tab
      updateCaheIframeListByActiveId(iframeTabActiveItem.id as string, newItem);
      return newItem;
    } else {
      const link = siderbarMenuLinkIsExternal
        ? siderbarTargetMenu.link
        : waitRenderLink;
      const newItem = {
        link,
        name: getIframeTabName(waitRenderLink, siderbarTargetMenu.name),
        metaTitle: siderbarTargetMenu.metaTitle,
        id: getUuid(),
        iframeKey: `${Date.now()}`,
        menuId: `${siderbarTargetMenu.id}`,
        pathSearch: waitRenderLinkPathSearch,
      };

      saveIframeTabToCache(iframeTabCacheList.concat(newItem));
      return newItem;
    }
  }
  /**
   * 未定位到菜单
   * 1. 新增未知异常新窗口
   * 2. 判断切换显示未知异常已存在窗口
   */
  const locationLink = guessIframeTabItemLink(toLinkPath(location.href));
  const locationLinkPathSearch =
    parseIframeMainUrlInfo(locationLink).pathSearch;
  const siblingProjectTarget = judgeIframeSiblingProject(location.href);
  if (iframeTabCacheList.length > 0) {
    // 缓存 是否存在 相同link
    let newItem = iframeTabCacheList.find((item) =>
      linkEqual(guessIframeTabItemLink(item.link), locationLink)
    );
    if (newItem) {
      return newItem;
    }
    const locationPath = getIframeTabPurePath(location.href);
    // 缓存 是否存在 相同 path
    newItem = iframeTabCacheList.find((item) => {
      const currentPath = getIframeTabPurePath(item.link);
      return linkEqual(currentPath, locationPath);
    });
    if (newItem) {
      const link = siblingProjectTarget ? newItem.link : locationLink;
      updateCaheIframeListByActiveId(newItem.id as string, { link });
      return {
        ...newItem,
        link,
        pathSearch: locationLinkPathSearch,
      };
    }
  }

  const newItem = {
    id: getUuid(),
    iframeKey: `${Date.now()}`,
    link: (siblingProjectTarget
      ? siblingProjectTarget.moduleUrl
      : locationLink) as string,
    name:
      siblingProjectTarget?.name ||
      getIframeTabName(location.pathname, '未知页面'),
    menuId: undefined,
    metaTitle: undefined,
    pathSearch: locationLinkPathSearch,
  };
  if (iframeTabActiveItem) {
    updateCaheIframeListByActiveId(iframeTabActiveItem.id as string, newItem);
  } else {
    saveIframeTabToCache(iframeTabCacheList.concat(newItem));
  }
  return newItem as IframeTabItem;
};

/**
 * 判断当前地址 是否 与iframeTabList 中link相同
 * @param iframeTabList
 */
export const findIframeTabItemByEqualUrl = (
  url: string,
  iframeTabList: IframeTabItem[]
) => {
  const target = iframeTabList.find((item) => {
    return linkEqual(
      guessIframeTabItemLink(url),
      guessIframeTabItemLink(item.link)
    );
  });
  return target;
};

/**
 * 同步外部locaiton数据到 iframe url
 */
export const getNewIframeTabLinkByLocaton = () => {
  const locationUrlConfig = parseIframeTabItemUrlInfo(location.href);
  const newTabItemLink = guessIframeTabItemLink(locationUrlConfig.pathSearch);
  return newTabItemLink;
};

/**
 * 刷新当前激活的 iframeTabItem
 * @param iframeTabActiveId
 * @param newLink
 * @param iframeTabList
 * @returns
 */
export const refreshIframeTabLink = (
  iframeTabActiveId: string,
  dataItem: TPlainObject,
  iframeTabList: IframeTabItem[]
) => {
  const findIndex = iframeTabList.findIndex(
    (item) => item.id === iframeTabActiveId
  );
  if (findIndex >= 0) {
    iframeTabList[findIndex] = {
      ...iframeTabList[findIndex],
      ...dataItem,
      ...{ iframeKey: `${Date.now()}` },
    };
  }
  return { iframeTabList, target: iframeTabList[findIndex] };
};

/**
 * 刷新当前激活的 iframeTabItem
 * @param iframeTabActiveId
 * @param newLink
 * @param iframeTabList
 * @returns
 */
export const refreshIframeTabIframeKey = (iframeTabActiveId: string) => {
  const iframeTabList = getIframeTabCacheList();
  const iframeTabTarget = iframeTabList.find(
    (item) => item.id === iframeTabActiveId
  );
  if (iframeTabTarget) {
    iframeTabTarget.iframeKey = `${Date.now()}`;
  }
  return iframeTabList;
};

export const updateCaheIframeListByActiveId = (
  activeId: string,
  option: Partial<IframeTabItem>
) => {
  const iframeTabList = getIframeTabCacheList();
  const targetIndex = iframeTabList.findIndex((item) =>
    valueIsEqual(item.id, activeId)
  );
  if (targetIndex >= 0) {
    iframeTabList[targetIndex] = { ...iframeTabList[targetIndex], ...option };
    saveCacheIframeActiveItem(iframeTabList[targetIndex]);
  }
  saveIframeTabToCache(iframeTabList);
};

/**
 * 外部针对出现 iframe tab标题为未知页面的配置
 * window['_iframeTabConfig'] = {
 *  '/system-get/menu3/detail': {
 *    name: '详情',
 *  },
 * };
 * @param pathOrUrl
 * @returns
 */
export const getIframeTabClientConfig = (pathOrUrl: string) => {
  const { path } = parseIframeTabItemUrlInfo(pathOrUrl);
  const config = window['_iframeTabConfig'] || {};
  const target = Object.keys(config).find((key) => {
    return urlJoin('/', key) === path;
  });
  return (target && isPlainObject(config[target]) ? config[target] : {}) as {
    name?: string;
  };
};

export const getIframeTabName = (pathOrUrl: string, defaultName: string) => {
  return getIframeTabClientConfig(pathOrUrl).name || defaultName;
};
