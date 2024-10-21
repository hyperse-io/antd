import { forwardRef, ReactElement, useImperativeHandle, useState } from 'react';
import { Button, Cascader, CascaderProps, message } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { isArray } from '@dimjs/lang';
import { cloneState } from '@dimjs/model';
import { classNames, extend, get } from '@dimjs/utils';
import {
  TAny,
  TPlainObject,
  treeLeafParentsArray,
  treeToTiledArray,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import {
  RequestStatus,
  TRequestStatusProps,
} from '../request-status/request-status.jsx';
import { cascaderWrapperModel } from './model.js';
import './style.less';

type CascaderWrapperServiceConfig = {
  params?: TPlainObject;
  onRequest?: (params?: TAny) => TAny;
  /**
   * 响应数据适配器
   */
  onRequestResultAdapter?: (respData: TAny) => TPlainObject[];
};

export type CascaderWrapperProps = Omit<
  CascaderProps<TAny>,
  | 'loading'
  | 'notFoundContent'
  | 'options'
  | 'value'
  | 'multiple'
  | 'onChange'
  | 'fieldNames'
> & {
  // 模型唯一值
  modelKey: string;
  /**
   * 参数Key映射
   * ```
   * 1. 默认值：value=value、label=label、children=children
   * 2. list 为 onRequest 返回数据中列表key值，可多级取值，例如： 'a.b.c'
   * 3. 配置 serviceConfig.onRequestResultAdapter后，fieldNames.list配置失效
   * 4. 如果没有配置list，可说明接口返回为数组
   * ```
   */
  fieldNames?: {
    list?: string;
    label?: string;
    value?: string;
    children?: string;
  };
  /**
   * 请求服务需求的数据，当设置`selectorList`后无效果
   */
  serviceConfig?: CascaderWrapperServiceConfig;
  // label渲染适配器
  onLabelRenderAdapter?: (dataItem: TPlainObject) => string | ReactElement;
  onSelectorListChange?: (dataList: TPlainObject[]) => void;
  /**
   * 是否动态加载选项
   */
  isDynamicLoad?: boolean;
  value?: string | number;
  onChange?: (value?: string | number, selectedList?: TPlainObject[]) => void;
  requestMessageConfig?: TRequestStatusProps['messageConfig'];
};

export type CascaderWrapperRefApi = {
  getCascaderList: () => TPlainObject[];
};
/**
 * 级联选择器包装组件，接收value和相应data都是叶子节点数据
 * @param props
 * @returns
 * ```
 * 1. 数据源中 value 不能重复
 * 2. 不支持多选
 * 3. modelKey的配置是为了缓存数据，只缓存初始化数据，如果isDynamicLoad=true，动态获取的数据不再缓存
 * 4. onChange操作第一个参数返回叶子节点value，第二个参数返回选中的多级数据
 * 5. isDynamicLoad=true 会在请求中添加当前选中option的fieldNames.value为key的数据
 * ```
 */
export const CascaderWrapper = forwardRef<
  CascaderWrapperRefApi,
  CascaderWrapperProps
>((props, ref) => {
  const {
    serviceConfig,
    modelKey,
    fieldNames,
    isDynamicLoad,
    requestMessageConfig,
    onSelectorListChange,
    ...otherProps
  } = props;
  const [options, setOptions] = useState<TAny[]>([]);

  const [loading, setLoading] = fbaHooks.useSafeState(false);
  const [state, actions] = cascaderWrapperModel(modelKey).useStore();
  const requestPreKey = `request-progress-${props.modelKey}`;
  const fieldNamesMerge = extend(
    true,
    { label: 'label', value: 'value', children: 'children' },
    fieldNames
  );
  const [valueList, setValueList] = useState<string[]>();

  const serviceRespDataAdapter = (respData) => {
    if (serviceConfig?.onRequestResultAdapter) {
      return serviceConfig.onRequestResultAdapter(
        respData as unknown as TPlainObject
      );
    }
    if (fieldNames?.list) {
      respData = get(respData, fieldNames?.list);
    }
    if (!isArray(respData)) {
      console.warn('接口返回数据不是数组类型，已被忽略', respData);
      return [];
    }
    return respData;
  };

  const startDataSourceRequest = hooks.useCallbackRef(async () => {
    if (!serviceConfig?.onRequest) {
      throw new Error('onRequest 调用接口服务不能为空');
    }
    try {
      setLoading(true);
      window[requestPreKey] = true;
      void actions.changeRequestStatus('request-progress');
      const respData = await serviceConfig.onRequest?.(serviceConfig.params);
      const respAdapterData = serviceRespDataAdapter(respData);
      if (isDynamicLoad) {
        respAdapterData.map((item) => {
          item.isLeaf = item.isLeaf || false;
        });
      }
      setLoading(false);
      window[requestPreKey] = false;
      void actions.setSelectBoxList({
        selectorList: respAdapterData || [],
      });
      onSelectorListChange?.(respAdapterData || []);
    } catch (error: any) {
      setLoading(false);
      window[requestPreKey] = false;
      void actions.changeRequestStatus('request-error');
      void message.error(error.message || '获取数据异常');
    }
  });

  fbaHooks.useEffectCustom(() => {
    if (window[requestPreKey]) return;
    if (state.requestStatus === 'request-success') {
      setOptions(cloneState(state.selectorList));
    } else {
      void startDataSourceRequest();
    }
  }, []);

  fbaHooks.useEffectCustom(() => {
    const cloneList = cloneState(state.selectorList);
    if (props.value) {
      const filterList = treeLeafParentsArray(
        props.value,
        treeToTiledArray(cloneList, fieldNamesMerge),
        true
      );
      if (filterList.length === 0) {
        setValueList([props.value as string]);
      } else {
        setValueList(filterList.map((item) => item.value) as string[]);
      }
    } else {
      setValueList(undefined);
    }
    setOptions(cloneList);
  }, [state.selectorList, props.value]);

  useImperativeHandle(ref, () => {
    return {
      getCascaderList: () => {
        return state.selectorList;
      },
    };
  });

  const onAgainRequest = hooks.useCallbackRef(() => {
    void startDataSourceRequest();
  });

  const loadData = async (selectedOptions: TAny[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const respData = await serviceConfig?.onRequest?.({
      ...serviceConfig.params,
      [fieldNamesMerge.value]: targetOption[fieldNamesMerge.value],
    });
    const respAdapterData = serviceRespDataAdapter(respData);
    if (!respAdapterData || respAdapterData.length === 0) {
      targetOption.isLeaf = true;
    } else {
      respAdapterData.map((item) => {
        item.isLeaf = item.isLeaf || false;
      });
      targetOption.children = respAdapterData;
    }
    targetOption.loading = false;
    void actions.setSelectBoxList({
      selectorList: options || [],
    });
    onSelectorListChange?.(options || []);
    setOptions([...options]);
  };

  const onChange = hooks.useCallbackRef(
    (values: Array<string | number>, selectList) => {
      void props.onChange?.(values?.[values.length - 1], selectList);
    }
  );

  const onClear = hooks.useCallbackRef(() => {
    void props.onChange?.(undefined);
  });

  return (
    <Cascader
      showSearch={true}
      allowClear={true}
      {...(otherProps as TAny)}
      popupClassName={classNames(
        'cascader-wrapper-popup',
        otherProps.popupClassName
      )}
      notFoundContent={
        <RequestStatus
          status={state.requestStatus}
          loading={loading}
          messageConfig={requestMessageConfig}
          errorButton={
            <Button type="primary" onClick={onAgainRequest}>
              重新获取数据
            </Button>
          }
        />
      }
      loading={loading}
      loadData={isDynamicLoad ? loadData : undefined}
      fieldNames={fieldNamesMerge}
      suffixIcon={
        state.requestStatus === 'request-error' ? (
          <RedoOutlined spin={loading} onClick={onAgainRequest} />
        ) : undefined
      }
      options={options}
      value={valueList}
      multiple={false}
      onChange={onChange}
      onClear={onClear}
    />
  );
});
