/**
 * iframe通信Demo：https://xx.xx.com/docs/admin/main/exchange
 */
export type IframeApiProps = {
  /** 广播消息到所有的iframes子页面 */
  broadcastMessages: <T>(data: T) => IframeApiProps;
  /** 发送特定消息到父亲级window对象 */
  postMessage: <T>(data: T) => IframeApiProps;
  /** 打开新的iframe tab窗口 */
  openNewTabItem: (data: {
    link: string;
    name: string;
    metaTitle?: string;
  }) => IframeApiProps;
  /**
   * 通过新iframe tab打开第三方页面
   * 
   * ```
   * 在第三方项目中触发在iframe main打开新tab，方法如下（案例：大数据-数据服务平台）
     const openNewTabItem = (
       menuItem: { id: string; link: string; name: string },
     ) => {
       if (menuItem?.id) {
         window.parent.postMessage(
           JSON.stringify({
             type: 'HYPERSE-LAYOUT',
             data: {
               type: 'redirect_to_frame_layout_menu_third_item',
               data: {
                 menuId: menuItem.id,
                 options: {
                   link: menuItem.link,
                   name: menuItem.name,
                 },
               },
             },
           }),
           '*'
         );
       } else {
         message.error(`未查询到菜单数据`);
       }
     };
   * ```
   */
  openNewThirdTabItem: (
    menuId: string | number,
    options: {
      link: string;
      name: string;
    }
  ) => IframeApiProps;
  /** 打开新的浏览器窗口 */
  openBrowserWindow: (url: string) => IframeApiProps;
  /** 刷新当前iframe tab */
  locationHref: (url: string) => IframeApiProps;
  /** iframe tab路由变更，可修改当前url地址（不会重新刷新当前页面） */
  tabItemHistoryChange: (link: string) => IframeApiProps;
  /** 通过菜单Id打开新的iframe tab窗口 */
  openNewTabItemByMenuId: (id: string) => IframeApiProps;
  /** 关闭当前iframe-tab，跳转上一个链路tab */
  closedIframeTabToPrevlink: () => IframeApiProps;
};
