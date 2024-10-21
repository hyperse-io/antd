import { Fragment, useEffect, useMemo, useState } from 'react';
import { Dropdown, MenuProps, Tabs, TabsProps } from 'antd';
import {
  CaretDownOutlined,
  CloseOutlined,
  LoadingOutlined,
  LogoutOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { arrayRemove } from '@dimjs/utils';
import { fbaHooks } from '@hyperse/antd';
import {
  arrayFindByLoosely,
  toLinkPath,
  TPlainObject,
  treeToArray,
  valueIsEqual,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { Loader } from '../../compts/loader/loader.js';
import { useLayoutCtx } from '../../context/layout-ctx.js';
import { IframePage } from './iframe-page.js';
import './style.less';
/**
 * 此处如果存在面包屑/tabbar路由菜单, 需要处理layout/flex布局问题
 * @param props
 */
const PageContent = () => {
  const {
    iframeTabList,
    // hideHeader,
    iframeTabBarExtra,
    iframeTabActiveItem,
    onIframeChange,
    onDeleteIframeTabItem,
    siderBarTileMenus,
    // headerHeight,
  } = useLayoutCtx();
  const [iframeLoadKeyList, setIframeLoadKeyList] = useState<string[]>([]);

  const [refreshIframeIds, setRefreshIframeIds] = useState<
    Array<string | number>
  >([]);

  const refreshIframeStart = hooks.useCallbackRef((tabItem) => {
    refreshIframeIds.push(tabItem.id);
    setRefreshIframeIds([...refreshIframeIds]);
  });

  const refreshIframeStartEnd = hooks.useCallbackRef((tabItem) => {
    const newArray = arrayRemove(refreshIframeIds, tabItem.id);
    setRefreshIframeIds([...newArray]);
  });

  fbaHooks.useEffectCustom(() => {
    if (iframeTabActiveItem.id) {
      window[`__refresh_iframe_${iframeTabActiveItem.id}`] = {
        start: () => {
          refreshIframeStart(iframeTabActiveItem);
        },
        end: refreshIframeStartEnd.bind(null, iframeTabActiveItem),
      };
    }
  }, [iframeTabActiveItem.id]);

  const onTabClick = hooks.useDebounceClick((key: string) => {
    onIframeChange(key, 'iframeTabClick');
  }, 200);

  const onTabItemRemove = hooks.useCallbackRef((tabItemKey) => {
    if (valueIsEqual(tabItemKey, iframeTabActiveItem.id)) {
      onDeleteIframeTabItem('me', tabItemKey as string);
    } else {
      onDeleteIframeTabItem('other', tabItemKey as string);
    }
  });

  const onClick = hooks.useCallbackRef((data) => {
    if (data.key === '1') {
      onIframeChange(iframeTabActiveItem.id as string, 'iframeRefresh');
    } else if (data.key === '2') {
      onDeleteIframeTabItem('otherAll');
    } else if (data.key === '3') {
      onDeleteIframeTabItem('all');
    }
  });

  const menuItems: MenuProps['items'] = [
    {
      label: '刷新当前',
      key: '1',
      onClick: onClick.bind(null, { key: '1' }),
      icon: <RedoOutlined />,
    },
    {
      label: '关闭其他',
      key: '2',
      onClick: onClick.bind(null, { key: '2' }),
      icon: <CloseOutlined />,
    },
    {
      label: '关闭所有',
      key: '3',
      onClick: onClick.bind(null, { key: '3' }),
      icon: <LogoutOutlined />,
    },
  ];

  const tabItems: TabsProps['items'] = iframeTabList.map((item) => {
    const pageSpinner = !arrayFindByLoosely(iframeLoadKeyList, item.iframeKey);
    let menuKey: undefined | string;
    if (item.menuId) {
      menuKey = siderBarTileMenus.find((temp) =>
        valueIsEqual(temp.id, item.menuId)
      )?.key;
    }
    // const fixHeight = hideHeader ? 38 : 38 + (headerHeight as number);
    return {
      label: item.name,
      key: `${item.id}`,
      style: {
        height: '100%',
        position: 'relative',
      },
      closable: true,
      closeIcon: arrayFindByLoosely(refreshIframeIds, item.id) ? (
        <LoadingOutlined />
      ) : (
        <span className="tab-icon"></span>
      ),
      children: (
        <Fragment>
          <Loader
            spinning={pageSpinner}
            style={{ backgroundColor: 'var(--bg-color)' }}
          />
          <IframePage
            id={item.id as string}
            link={item.link}
            iframeKey={item.iframeKey}
            onLoad={function (): void {
              const target = document.querySelector(
                `#iframe_${item.id}`
              ) as HTMLIFrameElement;
              try {
                if (target.contentWindow) {
                  target.contentWindow['__iframe_node_key'] =
                    `iframe_${item.id}`;
                }
              } catch (_error) {
                // 异常不处理，iframe写入属性可能会存在跨域问题
              }
              setIframeLoadKeyList((prev) => {
                return prev.concat(item.iframeKey);
              });
            }}
            menuKey={menuKey}
          />
        </Fragment>
      ),
    };
  });

  return (
    <Tabs
      hideAdd={true}
      items={tabItems}
      activeKey={iframeTabActiveItem?.id as string}
      onTabClick={onTabClick}
      // onChange={onTabChange}
      style={{ height: '100%' }}
      className="iframe-tabs"
      type={iframeTabList.length === 1 ? 'card' : 'editable-card'}
      onEdit={onTabItemRemove}
      tabBarExtraContent={{
        right: iframeTabBarExtra ? (
          iframeTabBarExtra
        ) : (
          <Dropdown
            menu={{ items: menuItems }}
            arrow={true}
            className="menu-tabs-operate"
            placement="bottomRight"
            overlayClassName="menu-tabs-operate-dropdown"
            // 此处不能使用 click
            trigger={['hover']}
          >
            <CaretDownOutlined />
          </Dropdown>
        ),
      }}
    />
  );
};

const PageContentSingleFrame = () => {
  const ctx = useLayoutCtx();
  const actived = ctx.iframeTabActiveItem;
  const [iframeLoadKeyList, setIframeLoadKeyList] = useState<string[]>([]);
  const pageSpinner = !arrayFindByLoosely(
    iframeLoadKeyList,
    actived?.iframeKey
  );
  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <Loader
        spinning={pageSpinner}
        style={{ backgroundColor: 'var(--bg-color)' }}
      />
      <iframe
        id={`iframe_${String(actived?.id)}`}
        src={actived?.link}
        width="100%"
        height="100%"
        key={actived?.iframeKey}
        style={{ border: 'none' }}
        onLoad={() => {
          setIframeLoadKeyList((prev) => {
            return prev.concat(actived?.iframeKey);
          });
        }}
      />
    </div>
  );
};

export const PageLevelContent = () => {
  const ctx = useLayoutCtx();

  const [activeItem, setActiveItem] = useState<TPlainObject>();

  const targetList = useMemo(() => {
    const targetList = treeToArray(ctx.completeMenus, 'children').find((item) =>
      valueIsEqual(item.id, ctx.siderBarMenuActiveItem?.id)
    )?.children as TPlainObject[];
    return targetList || [ctx.siderBarMenuActiveItem];
  }, [ctx.completeMenus, ctx.siderBarMenuActiveItem]);

  const items: TabsProps['items'] = useMemo(() => {
    return targetList?.map((item) => {
      return {
        key: `${item.id}`,
        label: item.name,
        children: <Fragment />,
      };
    });
  }, [targetList]);

  useEffect(() => {
    setActiveItem({ ...targetList[0], id: `${targetList[0]?.id}` });
  }, [targetList]);

  const onTabClick = (activeKey: string) => {
    if (valueIsEqual(activeKey, activeItem?.id)) {
      const frameInstance = document.querySelector(
        `#content_topmenu_${activeKey}`
      );
      setActiveItem({
        ...activeItem,
        key: Date.now(),
        link: toLinkPath(
          frameInstance?.['contentWindow']?.location?.href || activeItem?.link
        ),
      });
      return;
    }
    const target = targetList.find((item) => valueIsEqual(item.id, activeKey));
    setActiveItem({ ...target, id: `${target?.id}` });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {items.length > 1 ? (
        <Tabs
          tabBarStyle={{ margin: 0 }}
          onTabClick={onTabClick}
          defaultActiveKey="1"
          activeKey={activeItem?.id}
          items={items}
          type="card"
          className="content-top-menus"
        />
      ) : null}

      <iframe
        id={`content_topmenu_${activeItem?.id}`}
        src={activeItem?.link}
        width="100%"
        height="100%"
        key={activeItem?.key}
        style={{ border: 'none', flex: 1 }}
      />
    </div>
  );
};

export const LayoutIFrame = () => {
  const layoutCtx = useLayoutCtx();

  if (layoutCtx.multiFrameTabs) {
    return <PageContent />;
  }

  if (layoutCtx.siderBarMaxMenuLevel) {
    return <PageLevelContent />;
  }

  return <PageContentSingleFrame />;
};
