import { Fragment, useMemo } from 'react';
import { Menu } from 'antd';
import { classNames } from '@dimjs/utils';
import { ConfigProviderWrapper, SvgHttpView } from '@hyperse/antd';
import {
  isHttpUri,
  toLinkPath,
  treeToArray,
  valueIsEqual,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { useLayoutCtx } from '../../context/layout-ctx.js';
import { type TMenuItem } from '../../types/menu.js';
import { clearStorage } from '../../utils/menu.js';
import {
  findOneLeafNode,
  guessIframeMainLink,
  guessNormalItemLink,
} from '../../utils/utils.js';
import { Shrink } from '../shrink/index.jsx';
import { HeaderAccount } from './account/index.jsx';
import { HeaderBrand } from './brand/index.jsx';
import './style.less';

const HeaderBarIcon = (props: {
  iconImg?: string;
  iconImgActive?: string;
  activeColor?: string;
  textColor?: string;
  isActive?: boolean;
}) => {
  const svgImg = props.iconImg || props.iconImgActive;
  if (svgImg) {
    const isSvg = !isHttpUri(svgImg) ? true : svgImg.endsWith('.svg');
    if (isSvg) {
      return (
        <Fragment>
          {props.isActive ? (
            <div
              className="menu-icon-img-active"
              style={{ marginRight: 5, display: 'block' }}
            >
              {props.iconImgActive ? (
                <SvgHttpView
                  svgUrl={props.iconImgActive}
                  color={props.textColor}
                  style={{ display: 'block' }}
                  width={16}
                  height={16}
                />
              ) : (
                <SvgHttpView
                  svgUrl={svgImg}
                  color={props.activeColor}
                  style={{ display: 'block' }}
                  width={16}
                  height={16}
                />
              )}
            </div>
          ) : (
            <div
              className="menu-icon-img"
              style={{ marginRight: 5, display: 'block' }}
            >
              <SvgHttpView
                svgUrl={svgImg}
                color={props.textColor}
                style={{ display: 'block' }}
                width={16}
                height={16}
              />
            </div>
          )}
        </Fragment>
      );
    }
  }

  if (props.iconImg && props.iconImgActive) {
    return (
      <Fragment>
        {props.isActive ? (
          <div
            className="menu-icon-img-active"
            style={{
              backgroundImage: `url(${props.iconImgActive})`,
              marginRight: 5,
              display: 'block',
            }}
          />
        ) : (
          <div
            className="menu-icon-img"
            style={{
              backgroundImage: `url('${props.iconImg}')`,
              marginRight: 5,
              display: 'block',
            }}
          />
        )}
      </Fragment>
    );
  }
  return <Fragment />;
};

export const Header = () => {
  const layoutCtx = useLayoutCtx();
  const { menus, topMenuActiveItem, siderBarMenus, headerHeight } = layoutCtx;
  const activeColor = layoutCtx.headerThemeConfig?.menuSelectedTextColor;
  const textColor = layoutCtx.headerThemeConfig?.textColor;

  const topMenus = useMemo(() => {
    return layoutCtx.disableTopbarMenu
      ? []
      : menus.map((item) => ({
          key: `${item.id}`,
          icon: layoutCtx.showHeaderMenuIcon ? (
            <HeaderBarIcon
              iconImg={item.iconImg}
              iconImgActive={item.iconImgActive}
              activeColor={activeColor}
              textColor={textColor}
              isActive={valueIsEqual(topMenuActiveItem?.id, item.id)}
            />
          ) : undefined,
          label: item.name,
        }));
  }, [
    activeColor,
    layoutCtx.disableTopbarMenu,
    layoutCtx.showHeaderMenuIcon,
    menus,
    textColor,
    topMenuActiveItem?.id,
  ]);

  const onClick = hooks.useCallbackRef((data) => {
    const targetItem = menus.filter((item) =>
      valueIsEqual(data.key, item.id)
    )[0];

    if (targetItem.target === '_blank') {
      window.open(targetItem.link);
      return;
    }
    const isIframeRoute = layoutCtx.iframeTopbarMenuClickType === 'route';
    const isNormal = layoutCtx.layoutMode === 'normal';
    if (!isNormal && isIframeRoute) {
      if (!valueIsEqual(layoutCtx.topMenuActiveItem?.id, targetItem.id)) {
        layoutCtx.iframeTopRouteMenuChange(targetItem);
      }
      return;
    }
    if (!isNormal && !valueIsEqual(targetItem?.id, topMenuActiveItem?.id)) {
      // 清理上一个TOPBAR链接的storage缓存.
      clearStorage();
    }
    /**
     * 此处后端配置的link 可能权限不存在，直接获取第一个子菜单的叶子节点link
     * 1. 如果有 link，则直接使用
     * 2. 如果没有配置link，则使用children中的第一个叶子节点
     */
    if (targetItem.link) {
      // top menu中配置的 菜单域名可能不同，不能使用 当前GLOBAL中的host，直接使用link
      window.location.href = toLinkPath(targetItem.link);
    } else {
      const leafNode = findOneLeafNode(
        treeToArray(targetItem.children || [], 'children') as TMenuItem[]
      );
      if (leafNode?.link) {
        window.location.href = toLinkPath(
          isNormal
            ? guessNormalItemLink(leafNode.link)
            : guessIframeMainLink(leafNode.link)
        );
        return;
      } else if (leafNode?.path) {
        window.location.href = toLinkPath(
          isNormal
            ? guessNormalItemLink(leafNode.path)
            : guessIframeMainLink(leafNode.path)
        );
        return;
      }
    }
  });
  const className = classNames('hyperse-layout-main-header', {
    'hyperse-layout-main-header-has-menu': topMenus.length > 0,
  });
  return (
    <div className={className} style={{ height: headerHeight as number }}>
      {siderBarMenus.length === 0 || layoutCtx.hideSidebarMenu ? (
        <HeaderBrand />
      ) : null}
      {layoutCtx.showTopMenuShrink ? (
        <Shrink className="header-shrink" />
      ) : null}

      {layoutCtx.systemName ? (
        <div className="hyperse-layout-system-name">{layoutCtx.systemName}</div>
      ) : null}
      <div className="hyperse-layout-header-fill">
        <ConfigProviderWrapper
          theme={{
            token: {
              fontSize: layoutCtx.headerThemeConfig?.menuTextFontSize,
            },
            components: {
              Menu: {
                itemColor: layoutCtx.headerThemeConfig?.menuColor,
                itemHoverColor:
                  layoutCtx.headerThemeConfig?.menuActiveTextColor,
                horizontalItemSelectedBg:
                  layoutCtx.headerThemeConfig?.menuSelectedBgColor,
                horizontalItemSelectedColor:
                  layoutCtx.headerThemeConfig?.menuSelectedTextColor,
              },
            },
          }}
          {...layoutCtx.topMenuConfigProviderProps}
        >
          {topMenus.length > 0 ? (
            <Menu
              className="hyperse-layout-topmenu"
              mode="horizontal"
              overflowedIndicatorPopupClassName="hyperse-layout-topmenu-overflowed-modal"
              direction="rtl"
              triggerSubMenuAction="click"
              selectedKeys={
                topMenuActiveItem?.id ? [`${topMenuActiveItem.id}`] : undefined
              }
              // defaultSelectedKeys={topMenuActiveItem?.id ? [`${topMenuActiveItem.id}`] : undefined}
              items={topMenus}
              onClick={onClick}
              theme="light"
            />
          ) : null}
        </ConfigProviderWrapper>
        {layoutCtx.Header ? <layoutCtx.Header /> : null}
      </div>
      <HeaderAccount />
    </div>
  );
};
