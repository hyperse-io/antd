import { TPlainObject } from '@hyperse/utils';
import { fbaUtils } from '../fba-utils/index.js';
import { useLocalLoadingCtx } from './context.js';
import { LocalLoadingInner } from './local-loading.jsx';

/**
 * 局部加载，包含接口数据处理逻辑
 * ```
 * 包括
 * 1. loading显示效果
 * 2. error显示效果
 * 3. 获取服务数据
 * 4. 当 serviceConfig.params 值与上一次值不相等时，会主动发起服务调用
 * ```
 */
export const LocalLoading = fbaUtils.attachPropertiesToComponent(
  LocalLoadingInner,
  {
    useLocalLoading: () => {
      const ctx = useLocalLoadingCtx();
      return {
        onRequest: (params?: TPlainObject) => {
          ctx.onRequest(params);
        },
      };
    },
  }
);
