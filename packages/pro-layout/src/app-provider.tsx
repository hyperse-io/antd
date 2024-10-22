import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUndefined } from '@dimjs/lang';
import { cloneState } from '@dimjs/model';
import { extend } from '@dimjs/utils';
import { fbaHooks } from '@hyperse/antd';
import {
  arrayFindByLoosely,
  arrayFindIndexByLoosely,
  toLinkPath,
  treeToArray,
  valueIsEqual,
} from '@hyperse/utils';
import { App } from './app-layout.jsx';
import { ErrorHandling } from './compts/error-handling/index.jsx';
import { NormalRoutesTiming } from './compts/routes-timing/normal-timing.jsx';
import { LayoutProvider } from './context/layout-ctx.js';
import {
  type IframeTabItem,
  type LayoutCtxProps,
  type TMenuItem,
} from './types/index.js';
import {
  pathIncludePath,
  saveIframeOpenNewTabItemOperateLink,
} from './utils/index.js';
import {
  addIframeTabListByMenuItem,
  addOrUpdateIframeTabListByMenuItem,
  findFirstLeafNode,
  findIframeTabItemByEqualUrl,
  getCacheIframeActiveItem,
  getIframeTabCacheList,
  getIframeTabName,
  getTargetMenuParentChain,
  initSyncIframeTabCacheByLocation,
  linkEqual,
  parseFirstMenuByPath,
  parseSiderTargetMenuByPath,
  refreshIframeTabIframeKey,
  refreshIframeTabLink,
  saveCacheIframeActiveItem,
  saveIframeTabToCache,
} from './utils/menu.js';
import {
  getPurePath,
  guessIframeTabItemLink,
  parseIframeTabItemUrlInfo,
} from './utils/utils.js';

export const AppProvider = (props) => {
  const navigate = useNavigate();
  const {
    sidebarWidth,
    componentSize,
    locale,
    logoPath,
    headerThemeConfig,
    sidebarThemeConfig,
    completeMenus,
    ...options
  } = props;
  const isIframeMain = options.layoutMode === 'iframe-main';
  const unMatchHiddenSiderBar = isUndefined(options.unMatchHiddenSiderBar)
    ? true
    : options.unMatchHiddenSiderBar;

  const hideSidebarMenu = (function () {
    if (options.disableTopbarMenu) return false;
    return (
      typeof options.hideSidebarMenu === 'function'
        ? options.hideSidebarMenu()
        : options.hideSidebarMenu
    ) as boolean | undefined;
  })();

  const [collapsed, setCollapsed] = useState<boolean>(
    props.initSidebarShrinkClosed
  );
  const [opendKeys, setOpendKeys] = useState<Array<string>>([]);
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([]);

  const [siderBarMenuActiveItem, setSiderBarMenuActiveItem] =
    useState<TMenuItem>();
  const [topMenuActiveItem, setTopMenuActiveItem] = useState<TMenuItem>();
  const [siderBarMenus, setSiderBarMenus] = useState<TMenuItem[]>([]);
  // const initSiderBarMenuActiveItemRef = useRef<TMenuItem>();

  const opendKeysTempRef = useRef<string[]>();
  const ErrorHandlingRender = options.ErrorHandling || ErrorHandling;

  const siderBarTileMenus = useMemo(() => {
    return treeToArray(siderBarMenus, 'children') as TMenuItem[];
  }, [siderBarMenus]);

  const getTopMenuItem = (menuId: string | number) => {
    const chainMenuIdList = getTargetMenuParentChain(menuId, menus);
    if (chainMenuIdList.length > 0) {
      const setTopMenuActiveId = chainMenuIdList[chainMenuIdList.length - 1];
      return menus.find((item) => valueIsEqual(item.id, setTopMenuActiveId));
    }
    return undefined;
  };

  const { menus, tileMenus } = useMemo(() => {
    const menus = props.menus as TMenuItem[];
    const tileMenus = treeToArray(menus, 'children') as TMenuItem[];
    let siderBarMenus: TMenuItem[] = [];
    let siderbarTargetMenu: TMenuItem | undefined = undefined;
    // 隐藏 侧边栏
    if (hideSidebarMenu) {
      if (!options.disableTopbarMenu) {
        const target = menus.find((item) => {
          return pathIncludePath(getPurePath(location.pathname), item.path);
        });
        if (target) {
          setTopMenuActiveItem(target);
        }
      }
    } else {
      /**
       * 先查找叶子节点菜单，再反向查找上级菜单
       */
      siderbarTargetMenu = parseSiderTargetMenuByPath(
        tileMenus,
        location.href
      ) as TMenuItem;
      if (siderbarTargetMenu) {
        const chainMenuIdList = getTargetMenuParentChain(
          siderbarTargetMenu.id,
          menus
        );
        if (!options.disableTopbarMenu) {
          if (chainMenuIdList.length > 0) {
            const setTopMenuActiveId =
              chainMenuIdList[chainMenuIdList.length - 1];
            const topMenuTarget = menus.find((item) =>
              valueIsEqual(item.id, setTopMenuActiveId)
            );
            setTopMenuActiveItem(topMenuTarget);
            siderBarMenus = topMenuTarget?.children || [];
          }
        } else {
          siderBarMenus = menus;
        }
        setSelectedKeys(chainMenuIdList);
        setOpendKeys(chainMenuIdList);
        opendKeysTempRef.current = chainMenuIdList;
        setSiderBarMenuActiveItem(siderbarTargetMenu);
        // initSiderBarMenuActiveItemRef.current = siderbarTargetMenu;
        document.title =
          siderbarTargetMenu.metaTitle || siderbarTargetMenu.name;
      } else {
        if (options.disableTopbarMenu) {
          siderBarMenus = menus;
          setSelectedKeys([]);
          setOpendKeys([]);
          opendKeysTempRef.current = [];
          setSiderBarMenuActiveItem(undefined);
          // initSiderBarMenuActiveItemRef.current = siderbarTargetMenu;
        } else {
          // 当开启顶部菜单时，找不到叶子节点，有可能找到顶部菜单
          const target = parseFirstMenuByPath(menus, location.href);
          if (target) {
            if (!unMatchHiddenSiderBar) {
              siderBarMenus = target?.children || [];
            }
          } else {
            if (!unMatchHiddenSiderBar) {
              siderBarMenus = menus[0].children || [];
            }
          }

          setTopMenuActiveItem(target);
        }
      }
      if (isIframeMain) {
        const initIframeTabActiveItem = initSyncIframeTabCacheByLocation(
          treeToArray(siderBarMenus, 'children') as TMenuItem[],
          siderbarTargetMenu
        );
        saveCacheIframeActiveItem(initIframeTabActiveItem);
      }
    }
    setSiderBarMenus(siderBarMenus);

    return { menus, tileMenus };
  }, [
    isIframeMain,
    options.disableTopbarMenu,
    hideSidebarMenu,
    unMatchHiddenSiderBar,
  ]);

  const [iframeTabActiveItem, setIframeTabActiveItem] = useState<
    IframeTabItem | undefined
  >(getCacheIframeActiveItem());
  const [iframeTabList, setIframeTabList] = useState<IframeTabItem[]>(
    getIframeTabCacheList()
  );

  fbaHooks.useEffectCustom(() => {
    saveIframeTabToCache(iframeTabList);
  }, [iframeTabList]);

  fbaHooks.useEffectCustom(() => {
    if (iframeTabActiveItem?.id) {
      saveCacheIframeActiveItem(iframeTabActiveItem);
      document.title =
        iframeTabActiveItem.metaTitle || iframeTabActiveItem.name;
      navigate(iframeTabActiveItem.pathSearch);
    }
  }, [iframeTabActiveItem]);

  const onChangeCollapsed = (boo) => {
    if (boo) {
      opendKeysTempRef.current = opendKeys;
    } else {
      setOpendKeys(opendKeysTempRef.current || []);
    }
    setCollapsed(boo);
  };

  const onChangeSelectedKeys = (selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
  };

  const onChangeOpendKeys = (opendKeys: string[]) => {
    setOpendKeys(opendKeys);
  };

  const addOrUpdateIframeTab = (item: TMenuItem) => {
    const { iframeTabActiveItem, iframeTabListNew } =
      addOrUpdateIframeTabListByMenuItem(item, getIframeTabCacheList());
    setIframeTabList([...iframeTabListNew]);
    setIframeTabActiveItem(iframeTabActiveItem);
    setSiderBarMenuActiveItem(item);
  };

  const onChangeSiderBarMenuActiveItem = (
    _siderBarMenus: TMenuItem[],
    _siderBarTileMenus: TMenuItem[],
    menuId?: string
  ) => {
    if (menuId) {
      const menuTarget = _siderBarTileMenus.find((item) =>
        valueIsEqual(item.id, menuId)
      );
      if (menuTarget) {
        setSiderBarMenuActiveItem(menuTarget);
        const chainMenuIdList = getTargetMenuParentChain(
          menuTarget.id,
          _siderBarMenus
        );
        setSelectedKeys(chainMenuIdList);
        setOpendKeys(chainMenuIdList);
        return;
      }
    }
    setSelectedKeys([]);
    setOpendKeys([]);
    setSiderBarMenuActiveItem(undefined);
  };

  const onIframeChange: LayoutCtxProps['onIframeChange'] = (
    id: string,
    type,
    configs
  ) => {
    if (type === 'iframeTabClick' || type === 'iframeRefresh') {
      if (valueIsEqual(id, iframeTabActiveItem?.id)) {
        if (type === 'iframeTabClick' && !options.iframeTabClickRefresh) return;
        const iframeTabListNew = refreshIframeTabIframeKey(
          iframeTabActiveItem?.id as string
        );
        setIframeTabList([...iframeTabListNew]);
      } else {
        const target = getIframeTabCacheList().find((item) =>
          valueIsEqual(item.id, id)
        ) as IframeTabItem;
        setIframeTabActiveItem(target);
        // const chainMenuIdList = getTargetMenuParentChain(target.menuId as string, menus);
        // console.log('chainMenuIdList', chainMenuIdList);

        let _siderBarMenus = siderBarMenus;
        let _siderBarTileMenus = siderBarTileMenus;
        if (!options.disableTopbarMenu) {
          const topMenuItem = getTopMenuItem(target.menuId as string);
          /**
           * 当前 iframeTabList 是否存在 无匹配订单id的tab，例如： 未知异常页面；tab切换时，需要切换显示左侧菜单
           */
          if (iframeTabList.find((item) => !item.menuId)) {
            if (target.menuId) {
              const _topMenuActiveItem = topMenuItem;
              // if (!_topMenuActiveItem) {
              //   _topMenuActiveItem = topMenuItem;
              // }
              _siderBarMenus = _topMenuActiveItem?.children || [];
              _siderBarTileMenus = treeToArray(
                _siderBarMenus,
                'children'
              ) as TMenuItem[];
              setSiderBarMenus(_siderBarMenus);
              setTopMenuActiveItem(_topMenuActiveItem);
            } else {
              _siderBarMenus = [];
              _siderBarTileMenus = [];
              if (unMatchHiddenSiderBar) {
                setSiderBarMenus(_siderBarMenus);
              }
              // 当开启顶部菜单时，找不到叶子节点，有可能找到顶部菜单
              const targetNew = parseFirstMenuByPath(menus, target?.link);
              setTopMenuActiveItem(targetNew);
            }
          } else {
            _siderBarMenus = topMenuItem?.children || [];
            _siderBarTileMenus = treeToArray(
              _siderBarMenus,
              'children'
            ) as TMenuItem[];
            setTopMenuActiveItem(topMenuItem);
            setSiderBarMenus(_siderBarMenus);
          }
        }
        onChangeSiderBarMenuActiveItem(
          _siderBarMenus,
          _siderBarTileMenus,
          target?.menuId
        );
      }
    } else if (type === 'menuClick') {
      if (valueIsEqual(id, siderBarMenuActiveItem?.id)) {
        const refreshResult = refreshIframeTabLink(
          iframeTabActiveItem?.id as string,
          {
            link: toLinkPath(siderBarMenuActiveItem?.link as string),
            name: siderBarMenuActiveItem?.name,
            metaTitle: siderBarMenuActiveItem?.metaTitle,
            pathSearch: siderBarMenuActiveItem?.path,
          },
          getIframeTabCacheList()
        );
        navigate(toLinkPath(siderBarMenuActiveItem?.path || ''));
        setIframeTabList([...refreshResult.iframeTabList]);
        setIframeTabActiveItem(extend({}, refreshResult.target));
        if (configs?.locationMenu) {
          onChangeSiderBarMenuActiveItem(siderBarMenus, siderBarTileMenus, id);
        }
        return;
      } else {
        const menuTarget = siderBarTileMenus.find((item) =>
          valueIsEqual(item.id, id)
        ) as TMenuItem;
        const { iframeTabActiveItem, iframeTabListNew } =
          addOrUpdateIframeTabListByMenuItem(
            menuTarget,
            getIframeTabCacheList()
          );
        setIframeTabList([...iframeTabListNew]);
        setIframeTabActiveItem(iframeTabActiveItem);
        setSiderBarMenuActiveItem(menuTarget);
        if (configs?.locationMenu) {
          onChangeSiderBarMenuActiveItem(siderBarMenus, siderBarTileMenus, id);
        }
      }
    }
  };

  const onDeleteIframeTabItem: LayoutCtxProps['onDeleteIframeTabItem'] = (
    type,
    id
  ) => {
    if (type === 'otherAll') {
      setIframeTabList(iframeTabActiveItem ? [iframeTabActiveItem] : []);
      return;
    }
    const iframeTabList = getIframeTabCacheList();
    let iframeTabListNew;
    let iframeTabActiveItemNew;
    let _siderBarMenus = siderBarMenus;
    let _siderBarTileMenus = siderBarTileMenus;
    if (type === 'all') {
      iframeTabListNew = [iframeTabList[0]];
      iframeTabActiveItemNew = iframeTabList[0];
    } else if (type === 'me') {
      const index = arrayFindIndexByLoosely(iframeTabList, id, 'id');
      const nextActive =
        index === 0 ? iframeTabList[1] : iframeTabList[index - 1];
      iframeTabList.splice(index, 1);
      iframeTabListNew = iframeTabList;
      iframeTabActiveItemNew = nextActive;
    } else if (type === 'other') {
      const index = arrayFindIndexByLoosely(iframeTabList, id, 'id');
      iframeTabList.splice(index, 1);
      setIframeTabList([...iframeTabList]);
      return;
    }
    if (!options.disableTopbarMenu) {
      if (iframeTabActiveItemNew?.menuId) {
        const _topMenuActiveItem = getTopMenuItem(
          iframeTabActiveItemNew.menuId
        );
        _siderBarMenus = _topMenuActiveItem?.children || [];
        _siderBarTileMenus = treeToArray(
          _siderBarMenus,
          'children'
        ) as TMenuItem[];
        setTopMenuActiveItem(_topMenuActiveItem);
        setSiderBarMenus(_siderBarMenus);
      } else {
        _siderBarMenus = [];
        _siderBarTileMenus = [];
        setTopMenuActiveItem(undefined);
        if (unMatchHiddenSiderBar) {
          setSiderBarMenus(_siderBarMenus);
        }
      }
    }
    setIframeTabList([...iframeTabListNew]);
    setIframeTabActiveItem(iframeTabActiveItemNew);
    onChangeSiderBarMenuActiveItem(
      _siderBarMenus,
      _siderBarTileMenus,
      iframeTabActiveItemNew?.menuId
    );
  };

  /** 关闭当前iframe tab并打开指定iframe tab */
  const onDeleteCurrentIframeTabItemOpenTargetIframeTab = (
    targetId?: string | number,
    menuId?: string
  ) => {
    const index = arrayFindIndexByLoosely(
      iframeTabList,
      iframeTabActiveItem?.id,
      'id'
    );
    iframeTabList.splice(index, 1);

    if (targetId) {
      const target = arrayFindByLoosely(iframeTabList, targetId, 'id');
      if (target) {
        setIframeTabActiveItem(target);
        setIframeTabList([...iframeTabList]);
        return;
      } else if (menuId) {
        const menuTarget = siderBarTileMenus.find((item) =>
          valueIsEqual(item.id, menuId)
        ) as TMenuItem;
        const { iframeTabActiveItem, iframeTabListNew } =
          addOrUpdateIframeTabListByMenuItem(menuTarget, iframeTabList);
        setIframeTabList([...iframeTabListNew]);
        setIframeTabActiveItem(iframeTabActiveItem);
        setSiderBarMenuActiveItem(menuTarget);
        return;
      }
    }
    setIframeTabList([...iframeTabList]);
    onIframeChange(iframeTabList[0].id as string, 'iframeTabClick');
  };

  const onIframeChangeByHttpUrl = (
    url: string,
    data: { name: string; metaTitle: string }
  ) => {
    const prevIframeTabActiveItem = cloneState(iframeTabActiveItem);
    const cahceTabList = getIframeTabCacheList();
    const { pathSearch } = parseIframeTabItemUrlInfo(url);
    const iframeTablink = guessIframeTabItemLink(url);
    const siderbarTargetMenu = parseSiderTargetMenuByPath(
      tileMenus,
      url
    ) as TMenuItem;
    if (siderbarTargetMenu) {
      const chainMenuIdList = getTargetMenuParentChain(
        siderbarTargetMenu.id,
        menus
      );
      if (chainMenuIdList.length > 0) {
        const parentId = chainMenuIdList[chainMenuIdList.length - 1];
        const targetTopMenuItem = menus.find((item) =>
          valueIsEqual(item.id, parentId)
        );

        setSiderBarMenuActiveItem(siderbarTargetMenu);
        setSelectedKeys(chainMenuIdList);
        setOpendKeys(chainMenuIdList);
        if (!options.disableTopbarMenu) {
          setSiderBarMenus(targetTopMenuItem?.children || []);
          setTopMenuActiveItem(targetTopMenuItem);
        }
      }

      const { iframeTabActiveItem, iframeTabListNew } =
        addOrUpdateIframeTabListByMenuItem(
          {
            ...siderbarTargetMenu,
            link: iframeTablink,
            name: data.name,
            metaTitle: data.metaTitle,
          },
          cahceTabList
        );
      setIframeTabList([...iframeTabListNew]);
      setIframeTabActiveItem(iframeTabActiveItem);
      saveIframeOpenNewTabItemOperateLink({
        startTabId: prevIframeTabActiveItem?.id as string,
        startTabMenuId: prevIframeTabActiveItem?.menuId,
        endTabId: iframeTabActiveItem.id as string,
      });
    } else {
      setSelectedKeys([]);
      setOpendKeys([]);
      if (unMatchHiddenSiderBar) {
        setSiderBarMenus([]);
      }
      setTopMenuActiveItem(undefined);
      setSiderBarMenuActiveItem(undefined);
      const target = findIframeTabItemByEqualUrl(iframeTablink, cahceTabList);
      if (target) {
        setIframeTabActiveItem(target);
        saveIframeOpenNewTabItemOperateLink({
          startTabId: prevIframeTabActiveItem?.id as string,
          startTabMenuId: prevIframeTabActiveItem?.menuId,
          endTabId: target.id as string,
        });
      } else {
        const { iframeTabListNew, iframeTabActiveItem } =
          addIframeTabListByMenuItem(cahceTabList, {
            link: iframeTablink,
            name: getIframeTabName(iframeTablink, data?.name || '未知页面'),
            metaTitle: options?.metaTitle,
            pathSearch: pathSearch,
          } as unknown as TMenuItem);
        setIframeTabList([...iframeTabListNew]);
        setIframeTabActiveItem(iframeTabActiveItem);
        saveIframeOpenNewTabItemOperateLink({
          startTabId: prevIframeTabActiveItem?.id as string,
          startTabMenuId: prevIframeTabActiveItem?.menuId,
          endTabId: iframeTabActiveItem.id,
        });
      }
    }
  };

  const onUpdateIframeTabName = (name: string) => {
    const target = getIframeTabCacheList().find((item) =>
      valueIsEqual(item.id, iframeTabActiveItem?.id)
    );
    if (target) {
      target.name = name;
      setIframeTabList(getIframeTabCacheList());
    }
  };

  const normalModePositionMenu = (link: string) => {
    const siderbarTargetMenu = parseSiderTargetMenuByPath(
      tileMenus,
      link
    ) as TMenuItem;
    if (siderbarTargetMenu) {
      const chainMenuIdList = getTargetMenuParentChain(
        siderbarTargetMenu.id,
        menus
      );
      setSelectedKeys(chainMenuIdList);
      setOpendKeys(chainMenuIdList);
      setSiderBarMenuActiveItem(siderbarTargetMenu);
      document.title = siderbarTargetMenu.metaTitle || siderbarTargetMenu.name;
    } else {
      if (options.disableTopbarMenu) {
        setSelectedKeys([]);
        setOpendKeys([]);
        setSiderBarMenuActiveItem(undefined);
      }
    }
  };

  const iframeTopRouteMenuChange = (item: TMenuItem) => {
    const leafNode = findFirstLeafNode(item);
    const { iframeTabActiveItem, iframeTabListNew } =
      addOrUpdateIframeTabListByMenuItem(leafNode, getIframeTabCacheList());

    setIframeTabList([...iframeTabListNew]);
    setIframeTabActiveItem(iframeTabActiveItem);
    if (leafNode) {
      const chainMenuIdList = getTargetMenuParentChain(leafNode.id, menus);
      setSiderBarMenuActiveItem(leafNode);
      setSelectedKeys(chainMenuIdList);
      setOpendKeys(chainMenuIdList);
    }
    setSiderBarMenus(item.children || []);
    setTopMenuActiveItem(item);
  };

  /**
   * 通过新iframe tab打开第三方菜单页面
   */
  const onOpenNewIframeThirdMenuItem: LayoutCtxProps['onOpenNewIframeThirdMenuItem'] =
    (data) => {
      const menuItem = data.menuItem;
      // 判断 iframeTabList 中是否存在于 data.link 完全相同
      const hasTarget = iframeTabList.find((item) =>
        linkEqual(item.link, data.link)
      );

      if (hasTarget) {
        onIframeChange(`${hasTarget.id}`, 'iframeTabClick');
      } else {
        onChangeSiderBarMenuActiveItem(
          siderBarMenus,
          siderBarTileMenus,
          `${menuItem.id}`
        );
        const { iframeTabListNew, iframeTabActiveItem } =
          addIframeTabListByMenuItem(iframeTabList, {
            ...menuItem,
            name: data.name,
            link: data.link,
          } as unknown as TMenuItem);
        setIframeTabList([...iframeTabListNew]);
        setIframeTabActiveItem(iframeTabActiveItem);
      }
    };

  const appProviderValue: LayoutCtxProps = {
    ...options,
    hideSidebarMenu,
    menus,
    completeMenus,
    siderBarMenus,
    siderBarTileMenus,
    sidebarWidth,
    componentSize,
    locale,
    routeList: options.routeList,
    breads: options.breads || {},
    logoPath,
    headerThemeConfig,
    sidebarThemeConfig,
    collapsed,
    onChangeCollapsed,
    opendKeys,
    selectedKeys,
    onChangeOpendKeys,
    onChangeSelectedKeys,
    iframeTabList,
    addOrUpdateIframeTab,
    iframeTabActiveItem,
    siderBarMenuActiveItem,
    onIframeChange,
    onDeleteIframeTabItem,
    onIframeChangeByHttpUrl,
    topMenuActiveItem,
    onUpdateIframeTabName,
    normalModePositionMenu,
    iframeTopRouteMenuChange,
    onDeleteCurrentIframeTabItemOpenTargetIframeTab,
    onOpenNewIframeThirdMenuItem,
  };
  return (
    <LayoutProvider value={appProviderValue}>
      {options.disableErrorHandling ? null : (
        <ErrorHandlingRender
          verifySessionExpired={appProviderValue.verifySessionExpired}
        />
      )}
      <App />
      {!isIframeMain && <NormalRoutesTiming />}
    </LayoutProvider>
  );
};
