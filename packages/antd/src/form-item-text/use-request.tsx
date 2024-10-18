import { useMemo, useRef, useState } from 'react';
import { Form } from 'antd';
import { isDeepEqual } from '@dimjs/lang';
import {
  isUndefinedOrNull,
  type TAny,
  toArray,
  type TPlainObject,
} from '@hyperse/utils';
import { fbaHooks } from '../fba-hooks/index.js';
import { FormItemWrapperProps } from '../form-item-wrapper/form-item-wrapper.js';
import { type FormItemTextServiceConfig } from './types.js';

export const useRequestFormItemText = (props: {
  serviceConfig?: FormItemTextServiceConfig;
  name?: FormItemWrapperProps['name'];
}) => {
  const serviceConfig = props.serviceConfig;
  const [loading, setLoading] = useState(false);
  const [respData, setRespData] = useState<TAny>();
  const prevParams = fbaHooks.usePrevious(serviceConfig?.params);
  const [status, setStatus] = useState<'success' | 'error' | 'init'>('init');
  const errorMsgRef = useRef<string>();
  const form = Form.useFormInstance();

  // 用于直接发起接口调用，不能用于比较
  const serviceParams = useMemo(() => {
    if (
      !serviceConfig?.params ||
      toArray(serviceConfig?.invalidParamKey).length === 0
    ) {
      return serviceConfig?.params;
    }
    const newParams = { ...serviceConfig?.params };
    serviceConfig?.invalidParamKey?.forEach((key) => {
      newParams[key] = undefined;
    });
    return newParams;
  }, [serviceConfig?.invalidParamKey, serviceConfig?.params]);

  const onInnerRequest = async (params?: TPlainObject) => {
    if (!serviceConfig) return;
    const mergeProps = { ...serviceParams, ...params };
    const keys = serviceConfig?.requiredParamsKeys;
    if (keys?.length) {
      const target = keys.find((item) => {
        return isUndefinedOrNull(mergeProps[item]);
      });
      if (target) {
        errorMsgRef.current = `缺少必填参数：${keys.join('、')}`;
        console.warn(errorMsgRef.current);
        setStatus('error');
        return;
      }
    }
    try {
      if (!loading) setLoading(true);
      setStatus('init');
      const respData = await serviceConfig.onRequest(mergeProps);
      const value = props.name ? form.getFieldValue(props.name) : undefined;
      const respDataFt = serviceConfig.onResponseAdapter
        ? serviceConfig.onResponseAdapter(respData, value)
        : respData;
      setRespData(respDataFt);
      setStatus('success');
    } catch (error: TAny) {
      console.error(error);
      errorMsgRef.current = error?.message || '接口调用异常';
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  fbaHooks.useEffectCustomAsync(onInnerRequest, []);

  fbaHooks.useEffectCustom(() => {
    if (!serviceConfig) return;
    if (prevParams) {
      if (!isDeepEqual(serviceConfig.params, prevParams)) {
        void onInnerRequest();
      }
    }
  }, [prevParams, serviceConfig?.params]);

  if (!serviceConfig) {
    return undefined;
  }

  return {
    loading,
    status,
    viewValue: respData,
    onRequest: onInnerRequest,
    errorMsg: errorMsgRef.current,
  };
};
