import { type TAny, type TPlainObject } from '@hyperse/utils';
import { useIframe } from '../layout/layout-iframe/use-iframe.js';

/**
 * iframe tab 注册刷新方法
 * ```
 * 1. 定义refreshKey唯一值
 * 2. 与 useRefreshRegisterIframeTab 结合实现iframe tab之间的刷新动作
 * ```
 */
export const useRegisterRefreshCurrentIframeTab = (
  refreshKey: string,
  onRefresh: (params?: TPlainObject) => Promise<void>
) => {
  useIframe(async (data: TAny) => {
    if (data.type === '__refresh-iframe-tab') {
      try {
        const iframeNodeKey = window['__iframe_node_key'] as string;
        const refreshFunc = window.parent[`__refresh_${iframeNodeKey}`];
        if (data.data.refreshKey === refreshKey) {
          refreshFunc.start();
          try {
            await onRefresh(data.data.params);
          } finally {
            refreshFunc.end();
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
};

/**
 * 根据 refreshKey，刷新指定iframe tab（在iframe tab中调用）
 * ```
 * 1. 使用 useRegisterRefreshCurrentIframeTab 定义的refreshKey
 * 2. 可通过 params 给刷新方法传参
 * ```
 * @returns
 */
export const useRefreshRegisterIframeTab = () => {
  const iframeApi = useIframe();
  return (refreshKey: string, params?: TPlainObject) => {
    iframeApi.postMessage({
      type: '__refresh-iframe-tab',
      data: {
        refreshKey: refreshKey,
        params,
      },
    });
  };
};
