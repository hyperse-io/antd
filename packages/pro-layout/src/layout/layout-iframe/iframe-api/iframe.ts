import { IframeTabItem } from '../../../types';
import { IFRAME_EVENT_FLAG } from './event';
import { IframeApiProps } from './types';

export const getActivedIframeElement = (actived: IframeTabItem) => {
  const activeFrame = document.querySelector(
    `#iframe_${String(actived?.id)}`
  ) as HTMLIFrameElement;
  return activeFrame;
};

const getAllIframeElements = () => {
  const allFrames = document.querySelectorAll(
    '[id^="iframe_"]'
  ) as unknown as HTMLIFrameElement[];
  return allFrames;
};

/**
 * 主父级窗体window对象使用的消息通讯
 */
export const iframeApi: IframeApiProps = {
  /**
   * 广播消息到所有的iframes子页面
   * @param data 消息内容
   */
  broadcastMessages<T>(data: T) {
    const allIframes = getAllIframeElements();
    for (let index = 0; index < allIframes.length; index++) {
      const iframe = allIframes[index];
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          type: IFRAME_EVENT_FLAG,
          data,
        }),
        '*'
      );
    }
    return iframeApi;
  },
  /**
   * 发送特定消息到父亲级window对象
   * @param data 消息内容
   */
  postMessage<T>(data: T) {
    window.parent.postMessage(
      JSON.stringify({
        type: IFRAME_EVENT_FLAG,
        data,
      }),
      '*'
    );
    return iframeApi;
  },
  openNewTabItem(data) {
    window.parent.postMessage(
      JSON.stringify({
        type: IFRAME_EVENT_FLAG,
        data: {
          type: 'redirect_to_frame_layout_menu_item',
          data,
        },
      }),
      '*'
    );
    return iframeApi;
  },
  openNewThirdTabItem(menuId, options) {
    window.parent.postMessage(
      JSON.stringify({
        type: IFRAME_EVENT_FLAG,
        data: {
          type: 'redirect_to_frame_layout_menu_third_item',
          data: { menuId: menuId, options },
        },
      }),
      '*'
    );
    return iframeApi;
  },
  openBrowserWindow(url: string) {
    window.parent.postMessage(
      JSON.stringify({
        type: IFRAME_EVENT_FLAG,
        data: {
          type: 'open_browser_window',
          data: { url },
        },
      }),
      '*'
    );
    return iframeApi;
  },
  locationHref(url: string) {
    window.parent.postMessage(
      JSON.stringify({
        type: IFRAME_EVENT_FLAG,
        data: {
          type: 'browser_location_href',
          data: { url },
        },
      }),
      '*'
    );
    return iframeApi;
  },
  tabItemHistoryChange(link: string) {
    window.parent.postMessage(
      JSON.stringify({
        type: IFRAME_EVENT_FLAG,
        data: {
          type: 'history_change',
          data: { link },
        },
      }),
      '*'
    );
    return iframeApi;
  },
  openNewTabItemByMenuId(menuId: string) {
    window.parent.postMessage(
      JSON.stringify({
        type: IFRAME_EVENT_FLAG,
        data: {
          type: 'open_iframe_tabitem_by_menu_id',
          data: menuId,
        },
      }),
      '*'
    );
    return iframeApi;
  },
  /** 关闭当前iframe-tab，跳转上一个链路tab */
  closedIframeTabToPrevlink() {
    const iframeNodeKey = window['__iframe_node_key'] as string;
    const closedIframeTabId = iframeNodeKey.replace('iframe_', '');
    window.parent.postMessage(
      JSON.stringify({
        type: IFRAME_EVENT_FLAG,
        data: {
          type: 'closed-iframe-tab-to-prevlink',
          data: {
            closedIframeTabId,
          },
        },
      }),
      '*'
    );
    return iframeApi;
  },
};
