import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, type MenuProps } from 'antd';
import { classNames } from '@dimjs/utils';
import {
  ConfigProviderWrapper,
  IconWrapper,
  InputWrapper,
  SvgHttpView,
} from '@hyperse/antd';
import {
  cloneObject,
  isHttpUri,
  toLinkPath,
  treeFilter,
  treeToArray,
  valueIsEqual,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { useLayoutCtx } from '../../context/layout-ctx.js';
import { type TMenuItem } from '../../types/menu.js';
import { HeaderBrand } from '../header/brand/index.jsx';
import { Shrink } from '../shrink/index.jsx';
import './style.less';

const { Sider } = Layout;

const SiderBarIcon = (props: {
  iconImg?: string;
  iconImgActive?: string;
  colorActive?: string;
  textColor?: string;
  icon?: string;
}) => {
  const svgImg = props.iconImg || props.icon;
  if (svgImg) {
    const isSvg = !isHttpUri(svgImg) ? true : svgImg.endsWith('.svg');
    if (isSvg) {
      return (
        <Fragment>
          <div className="menu-icon-img">
            <SvgHttpView
              svgUrl={svgImg}
              color={props.textColor}
              style={{ display: 'block' }}
              width={16}
              height={16}
            />
          </div>
          <div className="menu-icon-img-active">
            <SvgHttpView
              svgUrl={svgImg}
              color={props.colorActive}
              style={{ display: 'block' }}
              width={16}
              height={16}
            />
          </div>
        </Fragment>
      );
    }
  }

  if (props.iconImg && props.iconImgActive) {
    return (
      <Fragment>
        <div
          className="menu-icon-img"
          style={{ backgroundImage: `url(${props.iconImg})` }}
        />
        <div
          className="menu-icon-img-active"
          style={{ backgroundImage: `url(${props.iconImgActive})` }}
        />
      </Fragment>
    );
  }
  return <div className="menu-icon-placeholder" />;
};

export const SiderBar = () => {
  const [searchValue, setSearchValue] = useState<string>();
  const openKeysRef = useRef<string[]>();
  const layoutCtx = useLayoutCtx();
  let multipleOpen = layoutCtx.siderBarFirstMenuFoldMultipleOpen;
  multipleOpen = typeof multipleOpen === 'undefined' ? true : multipleOpen;
  const colorActive = layoutCtx.sidebarThemeConfig?.menuActiveTextColor;
  const textColor = layoutCtx.sidebarThemeConfig?.menuColor;
  const navigate = useNavigate();
  const { siderBarTileMenus } = layoutCtx;

  const menuItemActiveKeyRef = useRef<string | number>();

  const antdMenuitems = useMemo(() => {
    let menusTreeList = layoutCtx.siderBarMenus;
    if (searchValue) {
      menusTreeList = treeFilter(
        cloneObject(menusTreeList),
        (node) => {
          const value = node.name?.toLowerCase();
          return value.indexOf(searchValue.toLowerCase()) >= 0;
        },
        { childrenName: 'children' }
      ) as TMenuItem[];
      openKeysRef.current = treeToArray(menusTreeList, 'children').map((item) =>
        String(item.id)
      );
    } else {
      openKeysRef.current = undefined;
    }
    const getMenuItem = (
      itemList: TMenuItem[],
      index: number
    ): MenuProps['items'] => {
      return itemList.map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            key: String(item.id),
            icon: (
              <SiderBarIcon
                iconImg={item.iconImg}
                iconImgActive={item.iconImgActive}
                colorActive={colorActive}
                icon={item.icon}
                textColor={textColor}
              />
            ),
            label: item.name,
            children: getMenuItem(item.children, index + 1),
            popupClassName: 'hyperse-layout-sider-submenu-popup',
            className:
              index === 0 && !item.iconImg && !item.iconImgActive
                ? 'hyperse-layout-menu-item-no-icon'
                : undefined,
          };
        }
        return {
          key: String(item.id),
          icon: (
            <SiderBarIcon
              iconImg={item.iconImg}
              iconImgActive={item.iconImgActive}
              colorActive={colorActive}
              icon={item.icon}
              textColor={textColor}
            />
          ),
          label: item.name,
        };
      });
    };
    return getMenuItem(menusTreeList, 0);
  }, [colorActive, layoutCtx.siderBarMenus, searchValue]);

  const onClick = hooks.useCallbackRef((data) => {
    if (!valueIsEqual(menuItemActiveKeyRef.current, data.key)) {
      layoutCtx.siderBarMenuOnChange?.(data);
    }
    menuItemActiveKeyRef.current = data.key;
    const targetItem = siderBarTileMenus.filter((item) =>
      valueIsEqual(data.key, item.id)
    )[0];
    if (targetItem.target === '_blank') {
      window.open(targetItem.link);
      return;
    }
    window['__sider_bar_menu_click'] = true;
    layoutCtx.onChangeSelectedKeys(data.keyPath);
    if (layoutCtx.layoutMode === 'iframe-main') {
      layoutCtx.onIframeChange(data.key, 'menuClick');
      return;
    }
    if (targetItem.link) {
      window.location.href = toLinkPath(targetItem.link);
      return;
    }
    if (targetItem.path) {
      navigate(toLinkPath(targetItem.path));
      document.title = targetItem.metaTitle || targetItem.name;
    }
  });

  const onOpenChange = hooks.useCallbackRef((openKeys: string[]) => {
    if (!multipleOpen && openKeys.length > 0) {
      const target = openKeys[openKeys.length - 1];
      // 判断点击的是否为一级菜单
      if (
        layoutCtx.siderBarMenus.find((item) => valueIsEqual(item.id, target))
      ) {
        layoutCtx.onChangeOpendKeys([target]);
        return;
      }
    }
    layoutCtx.onChangeOpendKeys(openKeys);
  });

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // 在操作shrink时，两种类型的Menu结构都缓存时，在切换shrink时会出现错误菜单闪屏（未找到更合适的解决方案，此处修改Menu key值后菜单重置可解决闪屏问题）
    setRefreshKey(Date.now());
  }, [layoutCtx.collapsed]);

  const menuProps: MenuProps = {
    mode: !layoutCtx.collapsed ? 'inline' : 'vertical',
    items: antdMenuitems,
    inlineIndent: layoutCtx.sidebarThemeConfig?.inlineIndent,
    onClick: onClick,
    selectedKeys: layoutCtx.selectedKeys,
    onOpenChange: onOpenChange,
  };

  if (!layoutCtx.collapsed) {
    menuProps.openKeys = openKeysRef.current || layoutCtx.opendKeys;
  }

  const onSearchChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
  };

  const sliderBarColor = layoutCtx.sidebarThemeConfig?.bgColor || '';

  const manualControlShrink = window['__manual_control_shrink'];

  const onMouseLeave = () => {
    if (manualControlShrink || !layoutCtx.sidebarMouseHoverOpen) return;
    if (!layoutCtx.collapsed) {
      layoutCtx.onChangeCollapsed(true);
    }
  };
  const onMouseEnter = hooks.useDebounceClick(() => {
    if (manualControlShrink || !layoutCtx.sidebarMouseHoverOpen) return;
    if (layoutCtx.collapsed) {
      layoutCtx.onChangeCollapsed(false);
    }
  }, 500);

  return (
    <Sider
      theme="light"
      className="hyperse-layout-sider"
      collapsed={layoutCtx.collapsed}
      width={layoutCtx.sidebarWidth}
      collapsedWidth={layoutCtx.collapsedWidth}
    >
      <HeaderBrand />
      <ConfigProviderWrapper
        theme={{
          token: {
            controlHeight: layoutCtx.sidebarThemeConfig?.menuItemHeight,
            fontSize: layoutCtx.sidebarThemeConfig?.menuTextFontSize,
          },
          components: {
            Menu: {
              itemBg: layoutCtx.sidebarThemeConfig?.bgColor,
              itemColor: layoutCtx.sidebarThemeConfig?.menuColor,
              itemHoverColor: layoutCtx.sidebarThemeConfig?.menuActiveTextColor,
              itemHoverBg: layoutCtx.sidebarThemeConfig?.menuActiveBgColor,
              itemActiveBg: layoutCtx.sidebarThemeConfig?.menuActiveBgColor,
              itemSelectedColor:
                layoutCtx.sidebarThemeConfig?.menuSelectedTextColor,
              itemSelectedBg: layoutCtx.sidebarThemeConfig?.menuSelectedBgColor,
              subMenuItemBg: layoutCtx.sidebarThemeConfig?.menuSubMenuBgColor,
            },
          },
        }}
        {...layoutCtx.sidebarMenuConfigProviderProps}
      >
        {layoutCtx.sliderBarSearch ? (
          <div
            className={classNames('sider-bar-search', {
              'sider-bar-search-bgfff': valueIsEqual(
                sliderBarColor.toLocaleLowerCase(),
                ['#fff', '#ffff']
              ),
            })}
          >
            <InputWrapper
              allowClear
              placeholder="搜索"
              onChange={onSearchChange}
            />
            {multipleOpen ? (
              <div style={{ marginLeft: 10 }}>
                <IconWrapper
                  onClick={() => {
                    layoutCtx.onChangeOpendKeys([]);
                  }}
                  size="small"
                  icon={
                    <SvgHttpView
                      svgUrl="lucide/fold-vertical"
                      width={18}
                      height={18}
                    />
                  }
                />
              </div>
            ) : null}
          </div>
        ) : null}
        <Menu
          key={refreshKey}
          {...menuProps}
          onMouseLeave={onMouseLeave}
          onMouseEnter={onMouseEnter}
        />
      </ConfigProviderWrapper>
      {!layoutCtx.hideSidebarShrink && <Shrink className="sider-bar-shrink" />}
    </Sider>
  );
};
