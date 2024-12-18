import { type ReactElement, useMemo, useState } from 'react';
import { Button, Select, type SelectProps } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { isArray } from '@dimjs/lang';
import { get } from '@dimjs/utils';
import {
  type LabelValueItem,
  type TAny,
  type TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import {
  RequestStatus,
  type TRequestStatus,
  type TRequestStatusProps,
} from '../request-status/index.js';

export type SelectorWrapperSearchServiceConfig = {
  params?: TPlainObject;
  onRequest: (params?: TAny) => TAny;
  onRequestResultAdapter?: (respData: TAny) => TPlainObject[];
};

export type SelectorWrapperSearchProps = Omit<
  SelectProps,
  'onSearch' | 'notFoundContent' | 'options' | 'fieldNames' | 'loading'
> & {
  /**
   * 参数Key映射
   * ```
   * 1. list 为 onRequest 返回数据中列表key值，可多级取值，例如：'a.b.c'
   * 2. 配置 serviceConfig.onRequestResultAdapter后，fieldNames.list配置失效
   * ```
   */
  fieldNames?: {
    label: string;
    value: string;
    disabled?: string;
    searchKeyword?: string;
    list?: string;
  };
  /**
   * 请求服务需求的数据
   */
  serviceConfig: SelectorWrapperSearchServiceConfig;
  /**
   * 添加全部选项
   * ```
   * 1. 默认值label="全部"，value=""
   * 2. 可配置label、value
   * ```
   */
  showAllOption?: true | TPlainObject<string | number>;
  /** selectorList发生变更时触发，每次都会调用 */
  onSelectorListChange?: (dataList: TPlainObject[]) => void;
  /** 通过服务获取数据异常回调 */
  onSelectorRequestError?: (error: Error) => void;
  /** 交互文案配置 */
  requestMessageConfig?: TRequestStatusProps['messageConfig'];
  // label渲染适配器
  onLabelRenderAdapter?: (dataItem: TPlainObject) => string | ReactElement;
  // 自定义keyword值
  customKeyword?: string;
};
/**
 * 选择器简单包装组件
 * @param props
 * @returns
 * ```
 * 1. 只支持 search + 服务 功能
 * 2. 不会缓存接口数据
 * 3. 不会对value、onChange做任何处理
 * ```
 */
export const SelectorWrapperSearch = (props: SelectorWrapperSearchProps) => {
  const {
    showAllOption,
    serviceConfig,
    onSelectorListChange,
    onSelectorRequestError,
    requestMessageConfig,
    fieldNames,
    onLabelRenderAdapter,
    ...otherProps
  } = props;
  const [requestStatus, setRequestStatus] =
    useState<TRequestStatus>('request-init');
  const [dataSource, setDataSource] = useState<TPlainObject[]>();
  const optionsItemLabelField = fieldNames?.label || 'label';
  const optionsItemValueField = fieldNames?.value || 'value';
  const optionsItemDisabledField = fieldNames?.disabled || 'disabled';
  const searchKeyword = fieldNames?.searchKeyword || 'searchKeyword';
  const serviceParams = serviceConfig.params;

  const allOptionConfig = useMemo(() => {
    const isTrue = showAllOption === true;
    if (showAllOption) {
      return {
        label: isTrue ? '全部' : (showAllOption.label as string),
        value: isTrue ? '' : (showAllOption.value as TAny),
      };
    }
    return null;
  }, [showAllOption]);

  const serviceRespDataAdapter = (respData) => {
    if (serviceConfig.onRequestResultAdapter) {
      return serviceConfig.onRequestResultAdapter(
        respData as unknown as TPlainObject
      );
    }
    if (fieldNames?.list) {
      const result = get(respData, fieldNames?.list);
      return isArray(result) ? result : [];
    }
    return isArray(respData) ? respData : [];
  };

  const startDataSourceRequest = async (keyword) => {
    try {
      setRequestStatus('request-progress');
      const respData = await serviceConfig.onRequest?.({
        ...serviceParams,
        [searchKeyword]: keyword,
      });
      let respAdapterData = serviceRespDataAdapter(respData);
      onSelectorListChange?.(respAdapterData);
      if (optionsItemLabelField && optionsItemValueField) {
        respAdapterData = respAdapterData.map((item) => {
          return {
            ...item,
            label: item[optionsItemLabelField],
            value: item[optionsItemValueField],
            disabled: item[optionsItemDisabledField || 'disabled'],
          };
        });
      }

      respAdapterData.forEach((item) => {
        if (onLabelRenderAdapter) {
          item.label = onLabelRenderAdapter(item);
        }
      });

      if (allOptionConfig) {
        respAdapterData.unshift(allOptionConfig);
      }
      setDataSource(respAdapterData);
      setRequestStatus('request-success');
    } catch (error: any) {
      setRequestStatus('request-error');
      onSelectorRequestError?.(error);
    }
  };

  const onSearch = hooks.useDebounceCallback((value: string) => {
    setDataSource([]);
    void startDataSourceRequest(value);
  }, 300);

  fbaHooks.useEffectCustom(() => {
    if (props.customKeyword) {
      void startDataSourceRequest(props.customKeyword);
    }
  }, [props.customKeyword]);

  const loading = requestStatus === 'request-progress';
  return (
    <Select
      showSearch={true}
      allowClear={true}
      dropdownMatchSelectWidth={false}
      {...otherProps}
      style={{ width: '100%', ...props.style }}
      options={dataSource as LabelValueItem[]}
      filterOption={false}
      onSearch={onSearch}
      notFoundContent={
        <RequestStatus
          status={requestStatus}
          loading={loading}
          messageConfig={{
            'request-init': '请输入搜索条件',
            ...requestMessageConfig,
          }}
          errorButton={
            <Button type="primary" onClick={startDataSourceRequest}>
              重新获取数据
            </Button>
          }
        />
      }
      suffixIcon={
        requestStatus === 'request-error' ? (
          <RedoOutlined spin={loading} onClick={startDataSourceRequest} />
        ) : undefined
      }
      loading={loading}
    />
  );
};
