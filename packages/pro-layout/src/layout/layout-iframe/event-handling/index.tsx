import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { valueIsEqual } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { useLayoutCtx } from '../../../context/layout-ctx';
import {
  type IframeTabItem,
  type TGlobalData,
  type TMenuItem,
} from '../../../types/index';
import {
  getIframeOpenNewTabItemOperateLinkList,
  getIframeTabName,
  guessIframeMainLink,
  parseIframeMainUrlInfo,
  parseSiderTargetMenuByPath,
  updateCaheIframeListByActiveId,
} from '../../../utils';
import { useIframe } from '../use-iframe';

export type RedirectToFrameLayoutMenuItem = IframeTabItem;

export type EventHandlingConmunicationMessageType =
  | 'redirect_to_frame_layout_menu_item'
  | 'session_expired';

export type EventHandlingConmunicationMessage<
  T extends EventHandlingConmunicationMessageType,
> = {
  type: T;
  data: T extends 'redirect_to_frame_layout_menu_item'
    ? RedirectToFrameLayoutMenuItem
    : T extends 'session_expired'
      ? null
      : null;
};

export const EventHandling = () => {
  const navigate = useNavigate();
  const layoutCtx = useLayoutCtx();
  const { user, hostUrl } = hooks.useGlobal<TGlobalData>();

  useIframe<
    EventHandlingConmunicationMessage<'redirect_to_frame_layout_menu_item'>
  >((result) => {
    if (result.type === 'redirect_to_frame_layout_menu_item') {
      const iframeTabItem = result.data;
      layoutCtx.onIframeChangeByHttpUrl(
        guessIframeMainLink(iframeTabItem.link),
        {
          name: iframeTabItem.name,
          metaTitle: iframeTabItem.metaTitle,
        }
      );
    } else if (result.type === 'redirect_to_frame_layout_menu_third_item') {
      const menuId = result.data.menuId;
      const target = layoutCtx.siderBarTileMenus.find((item) =>
        valueIsEqual(item.id, menuId)
      );
      if (!target) {
        void message.error(`menuId：${menuId}，未匹配到菜单数据`);
        return;
      }
      const link = result.data['options'].link;
      const name = result.data['options'].name;
      layoutCtx.onOpenNewIframeThirdMenuItem({
        menuItem: target,
        link,
        name,
      });
    } else if (result.type === 'open_browser_window') {
      const url = result.data?.['url'];
      if (url) {
        window.open(url);
      }
    } else if (result.type === 'browser_location_href') {
      const url = result.data?.['url'];
      if (url) {
        window.location.href = guessIframeMainLink(url);
      }
    } else if (result.type === 'history_change') {
      if (layoutCtx.cancelIframeRouteSyncParent) {
        return;
      }
      const link = result.data?.['link'];
      const { pathSearch } = parseIframeMainUrlInfo(link);
      navigate(pathSearch);
      const target = parseSiderTargetMenuByPath(
        layoutCtx.siderBarTileMenus,
        link
      ) as TMenuItem;
      const tabName = getIframeTabName(link, target.name);
      // 更新缓存数据
      updateCaheIframeListByActiveId(
        layoutCtx.iframeTabActiveItem.id as string,
        {
          link,
          name: tabName,
          metaTitle: target.metaTitle,
          pathSearch,
        }
      );
      layoutCtx.onUpdateIframeTabName(tabName);
    } else if (result.type === 'open_iframe_tabitem_by_menu_id') {
      const id = result.data as unknown as string;
      const target = layoutCtx.siderBarTileMenus.find((item) =>
        valueIsEqual(item.id, id)
      );
      if (target) {
        if (target?.target === '_blank') {
          window.open(target.link);
          return;
        }
        layoutCtx.onIframeChange(target.id as string, 'menuClick', {
          locationMenu: true,
        });
      }
    } else if (result.type === 'closed-iframe-tab-to-prevlink') {
      const closedIframeTabId = result.data?.[
        'closedIframeTabId'
      ] as unknown as string;
      const operateLinkList = getIframeOpenNewTabItemOperateLinkList();
      if (closedIframeTabId) {
        const target = operateLinkList.find(
          (item) => item.endTabId === closedIframeTabId
        );
        layoutCtx.onDeleteCurrentIframeTabItemOpenTargetIframeTab(
          target?.startTabId,
          target?.startTabMenuId
        );
      }
    }
  });

  useIframe<EventHandlingConmunicationMessage<'session_expired'>>((result) => {
    if (result.type === 'session_expired') {
      layoutCtx.onSessionExpired?.(user, hostUrl);
    }
  });

  return <Fragment />;
};
