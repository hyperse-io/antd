import { useMemo, useState } from 'react';
import pubSub from 'pubsub-js';
import { isArray, isDeepEqual } from '@dimjs/lang';
import { get, sort } from '@dimjs/utils';
import { isUndefinedOrNull, type TPlainObject } from '@hyperse/utils';
import { fbaHooks } from '../fba-hooks/index.js';
import { type TRequestStatus } from '../request-status/index.js';
import {
  type SelectorServiceConfig,
  type SelectorWrapperProps,
} from './types.js';

export const useRequest = (options: {
  cacheKey: string;
  serviceConfig?: SelectorServiceConfig;
  hasOuterSelectorList?: boolean;
  onChange?: SelectorWrapperProps['onChange'];
  outerSelectorList?: SelectorWrapperProps['selectorList'];
  onRespDataChange?: (dataList?: TPlainObject[]) => void;
  onSelectorRequestError?: SelectorWrapperProps['onSelectorRequestError'];
  useCache: boolean;
  fieldNames: SelectorWrapperProps['fieldNames'];
}) => {
  const {
    cacheKey,
    serviceConfig,
    hasOuterSelectorList,
    outerSelectorList,
    onRespDataChange,
    onSelectorRequestError,
    onChange,
    useCache,
    fieldNames,
  } = options;
  const serviceRequestParams = serviceConfig?.params;
  const requiredParamsKeys = serviceConfig?.requiredParamsKeys || [];
  const hasServiceRequestParams =
    serviceRequestParams && Object.keys(serviceRequestParams).length > 0;

  const [stateSelectorList, setStateSelectorList] = useState<TPlainObject[]>();
  const [requestStatus, setRequestStatus] = useState<TRequestStatus>();
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const serviceRequestParamsStringify = useMemo(() => {
    try {
      if (hasServiceRequestParams) {
        const sortDataStringify = JSON.stringify(sort(serviceRequestParams));
        if (sortDataStringify === '{}') {
          return undefined;
        }
        return sortDataStringify;
      }
    } catch (_error) {
      //
    }
    return undefined;
  }, [hasServiceRequestParams, serviceRequestParams]);
  // 将 undefined => 'undefined'
  const serviceRequestCahceKey = `${serviceRequestParamsStringify}`;
  const serviceRequestCahceStatusKey = `${serviceRequestParamsStringify}_status`;
  const pubSubKey = `${cacheKey}_${serviceRequestCahceKey}`;

  // 上一个参数值
  const prevServiceRequestParamsStringify = fbaHooks.usePrevious(
    serviceRequestParamsStringify
  );
  const prevParams = fbaHooks.usePrevious(serviceRequestParams);

  const serviceRespDataAdapter = (respData) => {
    if (serviceConfig?.onRequestResultAdapter) {
      return serviceConfig?.onRequestResultAdapter(
        respData as unknown as TPlainObject
      );
    }
    if (fieldNames?.list) {
      const result = get(respData, fieldNames?.list);
      return isArray(result) ? result : [];
    }
    return respData;
  };

  const getWindowCacheData = () => {
    return window['__selector_wrapper_']?.[cacheKey];
  };
  const getWindowCacheValue = () => {
    return getWindowCacheData()?.[serviceRequestCahceKey];
  };
  const getWindowCacheStatus = () => {
    return getWindowCacheData()?.[serviceRequestCahceStatusKey];
  };

  const setWindowCache = (key, value) => {
    if (!window['__selector_wrapper_']) {
      window['__selector_wrapper_'] = {};
    }
    if (!window['__selector_wrapper_'][cacheKey]) {
      window['__selector_wrapper_'][cacheKey] = {};
    }
    window['__selector_wrapper_'][cacheKey][key] = value;
  };

  const onChangeRequestStatus = (status: TRequestStatus) => {
    setWindowCache(serviceRequestCahceStatusKey, status);
    setRequestStatus(status);
  };

  const onRequest = async () => {
    try {
      onChangeRequestStatus('request-progress');

      const respData = await serviceConfig?.onRequest?.(
        serviceRequestParams || {}
      );
      const respAdapterData = serviceRespDataAdapter(respData) || [];

      setWindowCache(serviceRequestCahceKey, respAdapterData);
      onChangeRequestStatus('request-success');
      setTimeout(() => {
        pubSub.publish(pubSubKey, {
          status: 'request-success',
          respData: respAdapterData,
        });
      });

      return respAdapterData;
    } catch (error: any) {
      console.error(error);
      onChangeRequestStatus('request-error');
      setStateSelectorList(undefined);
      setTimeout(() => {
        pubSub.publish(pubSubKey, {
          status: 'request-error',
        });
      });
      onSelectorRequestError?.(error);
      return Promise.reject();
    }
  };

  fbaHooks.useEffectCustomAsync(async () => {
    if (hasOuterSelectorList) {
      setRequestStatus('request-success');
      setStateSelectorList(outerSelectorList);
      onRespDataChange?.(outerSelectorList);
      return;
    }
    if (requiredParamsKeys.length > 0) {
      const isEmpty = serviceRequestParams
        ? requiredParamsKeys.find((key) =>
            isUndefinedOrNull(serviceRequestParams[key])
          )
        : true;
      if (isEmpty) {
        // 当依赖项查询条件为空时，清空当前缓存数据
        setStateSelectorList([]);
        setRequestStatus('no-dependencies-params');
        /**
         *  怎么判断数据是从有到无的
         *  每一次 params 变少，只要 上一次 params 值存在，就应该清空 value 值
         */
        if (prevServiceRequestParamsStringify) {
          onChange?.(undefined);
        }
        return;
      }

      // 不使用缓存模式
      if (useCache === false) {
        // 判断参数是否发生变化
        if (isDeepEqual(serviceRequestParams, prevParams)) {
          return;
        }
        try {
          setRequestStatus('request-progress');
          const respData = await serviceConfig?.onRequest?.(
            serviceRequestParams || {}
          );
          const respAdapterData = serviceRespDataAdapter(respData) || [];
          setRequestStatus('request-success');
          setStateSelectorList(respAdapterData);
          onRespDataChange?.(respAdapterData);
        } catch (error: any) {
          console.error(error);
          setRequestStatus('request-error');
          setStateSelectorList(undefined);
          onSelectorRequestError?.(error);
        }
        return;
      }
    }

    /**
     * 此处无法判断 调用props.onChange?.(undefined);
     * A、B、C
     * 例如：C依赖A、B，当外部只修改了一个元素，理论上应该应该清空C value 值（调用onChange(undefined)），如果此时外部直接回填A、B、C时，C无法回填成功；该场景只能在A、B的onChange事件中，清空C
     */
    // if (prevServiceRequestParamsStringify) {
    //   props.onChange?.(undefined);
    // }

    const status = getWindowCacheStatus();
    if (status === 'request-success') {
      const dataList = getWindowCacheValue();
      setStateSelectorList(dataList);
      setRequestStatus(status);
      onRespDataChange?.(dataList);
      return;
    }
    if (status === 'request-progress') {
      setRequestStatus(status);
      pubSub.subscribe(pubSubKey, (_msg, { status, respData }) => {
        if (status === 'request-success') {
          setRequestStatus(status);
          setStateSelectorList(respData);
          onRespDataChange?.(respData);
        } else {
          setRequestStatus('request-error');
          setStateSelectorList(undefined);
        }
      });
      return;
    }
    try {
      const respAdapterData = await onRequest();
      setStateSelectorList(respAdapterData);
      setRequestStatus('request-success');
      onRespDataChange?.(respAdapterData);
    } catch (error: any) {
      console.error(error);
      setRequestStatus('request-error');
      setStateSelectorList(undefined);
      onSelectorRequestError?.(error);
    }
  }, [JSON.stringify(serviceRequestParams), outerSelectorList, refreshKey]);

  const onRefreshRequest = () => {
    setRefreshKey(Date.now());
  };

  return {
    requestStatus,
    stateSelectorList,
    serviceRequestParamsStringify,
    onRefreshRequest,
  };
};
