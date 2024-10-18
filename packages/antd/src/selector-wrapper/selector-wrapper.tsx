import { useMemo, useRef } from 'react';
import { Button, Select } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { isString } from '@dimjs/lang';
import {
  arrayFind,
  TAny,
  toArray,
  TPlainObject,
  valueIsEqual,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { RequestStatus } from '../request-status/index.js';
import { SelectorWrapperProps } from './types.js';
import { useRequest } from './use-request.js';
import { getVauleList } from './utils.js';
import './style.less';
export * from './types.js';
/**
 * 选择器包装组件
 * ```
 * 1. 不支持搜索 + 调用服务模式
 * ```
 */
export const SelectorWrapper = (props: SelectorWrapperProps) => {
  const {
    serviceConfig,
    showAllOption,
    onSelectorListChange,
    onSelectorListAllChange,
    onSelectorRequestError,
    onLabelRenderAdapter,
    requestMessageConfig,
    selectorList: outerSelectorList,
    modelKey,
    fieldNames,
    value,
    labelInValue,
    useCache,
    ...otherProps
  } = props;

  const firstRenderSelectList = useRef(true);

  // props 是否存在 selectorList，selectorList = undefined 也算存在
  const hasOuterSelectorList = Object.prototype.hasOwnProperty.call(
    props,
    'selectorList'
  );
  const mergeFieldNames = {
    label: 'label',
    value: 'value',
    disabled: 'disabled',
    ...fieldNames,
  };

  const {
    label: optionsItemLabelField,
    value: optionsItemValueField,
    disabled: optionsItemDisabledField,
  } = mergeFieldNames;

  const allOptionConfig = useMemo(() => {
    if (!showAllOption) return null;
    const isTrue = showAllOption === true;
    return {
      [optionsItemLabelField]: isTrue ? '全部' : showAllOption.label,
      [optionsItemValueField]: isTrue ? '' : showAllOption.value,
    };
  }, [optionsItemLabelField, optionsItemValueField, showAllOption]);

  const isMultiple = valueIsEqual(props.mode, ['multiple']);

  const { requestStatus, stateSelectorList, onRefreshRequest } = useRequest({
    fieldNames: mergeFieldNames,
    cacheKey: modelKey,
    hasOuterSelectorList,
    onChange: props.onChange,
    serviceConfig,
    outerSelectorList,
    onRespDataChange: (dataList) => {
      if (firstRenderSelectList.current) {
        onSelectorListChange?.(dataList || []);
        firstRenderSelectList.current = false;
      }
      onSelectorListAllChange?.(dataList || []);
    },
    onSelectorRequestError,
    useCache: useCache === undefined ? true : useCache,
  });

  const onRespChange = hooks.useCallbackRef((selectedList: TPlainObject[]) => {
    if (labelInValue) {
      if (isMultiple) {
        props.onChange?.(selectedList, selectedList);
      } else {
        props.onChange?.(selectedList[0], selectedList);
      }
    } else {
      const valueList = selectedList.map((item) => item[optionsItemValueField]);
      if (isMultiple) {
        props.onChange?.(valueList, selectedList);
      } else {
        props.onChange?.(valueList[0], selectedList[0]);
      }
    }
  });

  const onInnerChange = hooks.useCallbackRef((_value, otherParams) => {
    if (!otherParams) return props.onChange?.(undefined);
    const selectedList = toArray<TAny>(otherParams);
    const targetList = [] as TPlainObject[];
    selectedList.forEach((item) => {
      if (
        showAllOption &&
        allOptionConfig &&
        item.value === allOptionConfig[optionsItemValueField]
      ) {
        targetList.push(allOptionConfig);
      } else {
        const filterTarget = arrayFind(
          stateSelectorList || [],
          item.value,
          optionsItemValueField
        );
        if (filterTarget) {
          targetList.push(filterTarget);
        }
      }
    });
    onRespChange(targetList);
  });

  const selectorAllList = useMemo(() => {
    if (requestStatus !== 'request-success') return [];
    if (!stateSelectorList || stateSelectorList.length === 0) return [];
    if (!allOptionConfig) return stateSelectorList;
    return [allOptionConfig].concat(stateSelectorList);
  }, [allOptionConfig, requestStatus, stateSelectorList]);

  const loading = requestStatus === 'request-progress';

  const selectValue = useMemo(() => {
    const targetList = getVauleList(value, optionsItemValueField);
    return isMultiple ? targetList : targetList[0];
  }, [isMultiple, optionsItemValueField, value]);

  const filterOption = hooks.useCallbackRef((input: string, option) => {
    const children = toArray(option.children);
    let mergeString = '';
    children.forEach((item) => {
      if (isString(item)) mergeString += item;
    });
    return mergeString.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  });

  return (
    <Select
      showSearch={true}
      allowClear={true}
      popupMatchSelectWidth={false}
      filterOption={filterOption}
      {...otherProps}
      style={{ width: '100%', ...props.style }}
      value={selectValue}
      loading={loading}
      onChange={onInnerChange}
      fieldNames={undefined}
      suffixIcon={
        requestStatus === 'request-error' ? (
          <RedoOutlined spin={loading} onClick={onRefreshRequest} />
        ) : (
          otherProps.suffixIcon
        )
      }
      notFoundContent={
        <RequestStatus
          status={requestStatus}
          loading={loading}
          messageConfig={{
            'request-init': '暂无数据',
            ...requestMessageConfig,
          }}
          errorButton={
            <Button type="primary" onClick={onRefreshRequest}>
              重新获取数据
            </Button>
          }
        />
      }
    >
      {selectorAllList.map((item, index) => {
        const value = item[optionsItemValueField];
        const label = item[optionsItemLabelField];
        return (
          <Select.Option
            value={value}
            label={label}
            key={`${value}-${index}`}
            disabled={item[optionsItemDisabledField]}
          >
            {props.showIcon ? (
              <span className="v-selector-item-icon">
                {props.icon?.(item, index)}
              </span>
            ) : null}
            {onLabelRenderAdapter ? onLabelRenderAdapter(item) : label}
          </Select.Option>
        );
      })}
    </Select>
  );
};
